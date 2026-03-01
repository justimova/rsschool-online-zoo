const nav = document.querySelector('.nav');
const burger = document.querySelector('.burger');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('[data-slider]').forEach((button) => {
  button.addEventListener('click', () => {
    const sliderName = button.getAttribute('data-slider');
    const dir = button.getAttribute('data-dir');
    const track = document.querySelector(`[data-slider-track="${sliderName}"]`);

    if (!track) return;

    const cards = Array.from(track.children);
    if (cards.length < 2) return;

    if (dir === 'next') {
      track.append(cards[0]);
    } else {
      track.prepend(cards[cards.length - 1]);
    }
  });
});

// const feedbackModal = document.getElementById('feedback-modal');
// const openModalBtn = document.querySelector('[data-open-modal="feedback"]');

// if (openModalBtn && feedbackModal) {
//   openModalBtn.addEventListener('click', () => {
//     feedbackModal.hidden = false;
//     document.body.style.overflow = 'hidden';
//   });

//   feedbackModal.querySelectorAll('[data-close-modal]').forEach((closeBtn) => {
//     closeBtn.addEventListener('click', () => {
//       feedbackModal.hidden = true;
//       document.body.style.overflow = '';
//     });
//   });
// }

// document.querySelectorAll('form').forEach((form) => {
//   form.addEventListener('submit', (event) => {
//     event.preventDefault();
//     form.reset();
//     if (form.classList.contains('feedback-form') && feedbackModal) {
//       feedbackModal.hidden = true;
//       document.body.style.overflow = '';
//     }
//   });
// });
