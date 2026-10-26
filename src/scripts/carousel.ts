import { reduceMotion } from './motion';

export interface CarouselOptions {
  root: Element | null;
  trackSelector: string;
  slideSelector: string;
  prevSelector: string;
  nextSelector: string;
  dotsSelector?: string;
  perView?: { wide?: number; desktop?: number; tablet?: number; mobile?: number };
  autoplay?: number;
  loop?: boolean;
}

/** Drag / swipe / arrow carousel with optional dots and autoplay. */
export function initCarousel(opts: CarouselOptions) {
  const root = opts.root;
  if (!root) return;
  const track = root.querySelector<HTMLElement>(opts.trackSelector);
  if (!track) return;
  const slides = Array.from(track.querySelectorAll<HTMLElement>(opts.slideSelector));
  if (!slides.length) return;

  const find = (sel: string) =>
    root.parentElement?.querySelector<HTMLButtonElement>(sel) ?? document.querySelector<HTMLButtonElement>(sel);
  const prevBtn = find(opts.prevSelector);
  const nextBtn = find(opts.nextSelector);
  const dotsWrap = opts.dotsSelector ? document.querySelector<HTMLElement>(opts.dotsSelector) : null;

  let index = 0;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;

  const slidesPerView = () => {
    const w = window.innerWidth;
    const pv = opts.perView;
    if (!pv) return 1;
    if (w >= 1280) return pv.wide || pv.desktop || 1;
    if (w >= 1024) return pv.desktop || 1;
    if (w >= 768) return pv.tablet || 1;
    return pv.mobile || 1;
  };
  const maxIndex = () => Math.max(0, slides.length - slidesPerView());
  const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || '0');

  function update() {
    track!.style.transform = `translateX(-${index * step()}px)`;
    // Force a synchronous reflow so slides that started far outside the viewport
    // are repainted once the transform brings them into view.
    void track!.offsetWidth;
    if (prevBtn) prevBtn.disabled = !opts.loop && index === 0;
    if (nextBtn) nextBtn.disabled = !opts.loop && index >= maxIndex();
    if (dotsWrap) Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function goTo(i: number) {
    const mi = maxIndex();
    if (opts.loop) i = i < 0 ? mi : i > mi ? 0 : i;
    else i = Math.max(0, Math.min(mi, i));
    index = i;
    update();
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  function restartAutoplay() {
    if (!opts.autoplay || reduceMotion) return;
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, opts.autoplay);
  }

  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
    }
  }

  nextBtn?.addEventListener('click', () => {
    next();
    restartAutoplay();
  });
  prevBtn?.addEventListener('click', () => {
    prev();
    restartAutoplay();
  });

  // Drag / swipe
  let isDown = false;
  let startX = 0;
  let startIndex = 0;
  let dragDelta = 0;
  const clientX = (e: MouseEvent | TouchEvent) => ('touches' in e ? e.touches[0].clientX : e.clientX);

  const pointerDown = (e: MouseEvent | TouchEvent) => {
    isDown = true;
    startX = clientX(e);
    startIndex = index;
    dragDelta = 0;
    track.classList.add('dragging');
  };
  const pointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDown) return;
    dragDelta = clientX(e) - startX;
    track.style.transform = `translateX(${-startIndex * step() + dragDelta}px)`;
  };
  const pointerUp = () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('dragging');
    if (Math.abs(dragDelta) > slides[0].getBoundingClientRect().width * 0.18) goTo(dragDelta < 0 ? startIndex + 1 : startIndex - 1);
    else update();
    restartAutoplay();
  };

  track.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  track.addEventListener('touchstart', pointerDown, { passive: true });
  track.addEventListener('touchmove', pointerMove, { passive: true });
  track.addEventListener('touchend', pointerUp);

  window.addEventListener('resize', update);
  update();
  restartAutoplay();
}
