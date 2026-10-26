import { reduceMotion } from './motion';

const KEY = 'pt-active';
const root = document.documentElement;
const MIN_SHOW = 700; // ms the logo stays on screen during a transition

/** Fade the overlay out once the new page has loaded. */
function reveal() {
  if (!root.classList.contains('pt-active')) return;
  const start = Number(sessionStorage.getItem(KEY)) || 0;
  const wait = Math.max(0, MIN_SHOW / 2 - (Date.now() - start));
  setTimeout(() => {
    root.classList.remove('pt-active');
    sessionStorage.removeItem(KEY);
  }, wait);
}

function isInternalNav(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute('download')) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  // Same-page anchors / same URL: no transition.
  if (url.pathname === location.pathname && url.search === location.search) return false;
  return true;
}

if (!reduceMotion) {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a');
    if (!a || !isInternalNav(a, e)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, String(Date.now()));
    root.classList.add('pt-active');
    setTimeout(() => (location.href = a.href), MIN_SHOW / 2);
  });
}

// Back/forward cache restores the page with the overlay still showing.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) root.classList.remove('pt-active');
});

if (document.readyState === 'complete') reveal();
else window.addEventListener('load', reveal);
