const panel = document.querySelector('.side-panel');

window.addEventListener('scroll', () => {
  panel.classList.toggle('is-scrolled', window.scrollY > 120);
}, { passive: true });
