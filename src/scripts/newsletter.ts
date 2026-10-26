/** Footer newsletter: front-end only confirmation (the original had no backend). */
const form = document.querySelector<HTMLFormElement>('.newsletter-form');
const note = document.querySelector('.newsletter-note');
if (form && note) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (!input?.value) return;
    note.classList.add('show');
    form.reset();
    setTimeout(() => note.classList.remove('show'), 4500);
  });
}
