import { initCarousel } from './carousel';

initCarousel({
  root: document.querySelector('.journeys'),
  trackSelector: '.journey-track',
  slideSelector: '.journey-card',
  prevSelector: '.journey-prev',
  nextSelector: '.journey-next',
  dotsSelector: '.journey-dots',
  perView: { desktop: 3, tablet: 2, mobile: 1 },
  loop: true,
});
