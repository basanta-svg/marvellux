import { initCarousel } from './carousel';

initCarousel({
  root: document.querySelector('.blog'),
  trackSelector: '.blog-track',
  slideSelector: '.blog-slide',
  prevSelector: '.blog-prev',
  nextSelector: '.blog-next',
  dotsSelector: '.blog-dots',
  perView: { desktop: 3, tablet: 2, mobile: 1 },
  loop: true,
  autoplay: 5600,
});
