import { reduceMotion } from './motion';

/** Fade/slide elements in as they scroll into view. */
export function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal, .reveal-pop');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  els.forEach((el) => io.observe(el));
}
