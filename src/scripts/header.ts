/** Sticky header, desktop dropdowns and the mobile nav overlay. */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Desktop dropdowns (hover + keyboard)
  document.querySelectorAll<HTMLElement>('.nav-item').forEach((item) => {
    const link = item.querySelector<HTMLElement>('.nav-link');
    const open = () => {
      item.classList.add('open');
      link?.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      item.classList.remove('open');
      link?.setAttribute('aria-expanded', 'false');
    };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    link?.addEventListener('focus', open);
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget as Node | null)) close();
    });
    link?.addEventListener('click', (e) => {
      if (item.querySelector('.dropdown')) {
        e.preventDefault();
        item.classList.contains('open') ? close() : open();
      }
    });
  });

  // Mobile nav
  const mobileNav = document.querySelector<HTMLElement>('.mobile-nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileClose = document.querySelector('.mobile-nav-close');
  if (!mobileNav) return;

  const openMobile = () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    header.classList.add('nav-open');
  };
  const closeMobile = () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    header.classList.remove('nav-open');
  };
  hamburger?.addEventListener('click', openMobile);
  mobileClose?.addEventListener('click', closeMobile);

  document.querySelectorAll<HTMLElement>('.mobile-nav-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.mobile-nav-item');
      const wasOpen = parent?.classList.contains('open');
      document.querySelectorAll('.mobile-nav-item.open').forEach((el) => el.classList.remove('open'));
      if (!wasOpen) parent?.classList.add('open');
    });
  });
  document.querySelectorAll('.mobile-nav a:not(.mobile-nav-toggle)').forEach((a) => a.addEventListener('click', closeMobile));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobile();
  });
}
