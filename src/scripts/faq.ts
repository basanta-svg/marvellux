/** Accordion behaviour for every .faq-item on the page. */
document.querySelectorAll<HTMLElement>('.faq-item').forEach((item) => {
  const q = item.querySelector<HTMLElement>('.faq-question');
  const a = item.querySelector<HTMLElement>('.faq-answer');
  if (!q || !a) return;
  q.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    item.classList.toggle('open', willOpen);
    q.setAttribute('aria-expanded', String(willOpen));
    a.style.maxHeight = willOpen ? a.scrollHeight + 'px' : '0px';
  });
});
