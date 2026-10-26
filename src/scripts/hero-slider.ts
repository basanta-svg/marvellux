import { reduceMotion } from './motion';

/** Auto-rotating cross-fade hero slider (no manual controls). */
const hero = document.querySelector('.hero');
if (hero && !reduceMotion) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  if (slides.length > 1) {
    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    setInterval(() => {
      index = (index + 1) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    }, 6500);
  }
}
