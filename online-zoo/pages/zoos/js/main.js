const panel = document.querySelector('.side-panel');

window.addEventListener('scroll', () => {
  panel.classList.toggle('is-scrolled', window.scrollY > 120);
}, { passive: true });



document.querySelector('.track').addEventListener('click', (e) => {
  const li = e.target.closest('li.item');
  if (!li) return;

  const url = li.dataset.url;
  if (!url) return;

  window.open(url, '_blank', 'noopener,noreferrer');
});
