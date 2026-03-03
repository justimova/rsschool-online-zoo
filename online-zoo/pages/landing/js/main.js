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


document.querySelectorAll('.meet-pets .card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;

    const a = card.querySelector('a[href]');
    if (!a) return;

    window.location.href = a.href;
  });

  card.style.cursor = 'pointer';
});

document.querySelectorAll('.favourite .card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) return;

    const a = card.querySelector('a[href]');
    if (!a) return;

    window.location.href = a.href;
  });

  card.style.cursor = 'pointer';
});



// document.addEventListener('click', (e) => {
//   const closeBtn = e.target.closest('[data-close-modal]');
//   if (!closeBtn) return;

//   const modal = closeBtn.closest('.modal');
//   if (!modal) return;

//   modal.hidden = true;

//   document.body.classList.remove('no-scroll');
// });

// function openModal(id) {
//   const modal = document.getElementById(id);
//   if (!modal) return;
//   modal.hidden = false;
//   document.body.classList.add('no-scroll');
// }

const careModal = document.getElementById('care-modal');

function openCareModal() {
  if (!careModal) return;
  careModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCareModal() {
  if (!careModal) return;
  careModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (careModal) {
  careModal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) {
      closeCareModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !careModal.hasAttribute('hidden')) {
      closeCareModal();
    }
  });
}

// document.addEventListener('click', (e) => {
//   const opener = e.target.closest('[data-open-modal]');
//   if (!opener) return;

//   e.preventDefault();

//   const id = opener.getAttribute('data-open-modal');
//   const modal = document.getElementById(id);
//   if (!modal) return;

//   modal.removeAttribute('hidden');
//   document.body.style.overflow = 'hidden';
// });




const donationModal = document.getElementById('donation-modal');

function openDonationModal() {
  if (!donationModal) return;
  donationModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDonationModal() {
  if (!donationModal) return;
  donationModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (donationModal) {
  donationModal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) {
      closeDonationModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !donationModal.hasAttribute('hidden')) {
      closeDonationModal();
    }
  });
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (!opener) return;

  e.preventDefault();

  const id = opener.getAttribute('data-open-modal');
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
});







(function () {
  const root = document.getElementById('favSelect');
  const btn = root.querySelector('.cs__btn');
  const text = root.querySelector('.cs__text');
  const panel = root.querySelector('.cs__panel');
  const list = root.querySelector('.cs__list');
  const opts = Array.from(root.querySelectorAll('.cs__opt'));
  const hidden = root.querySelector('input[type="hidden"]');

  const upBtn = root.querySelector('.cs__scroll-up');
  const downBtn = root.querySelector('.cs__scroll-down');
  const track = root.querySelector('.cs__track');
  const thumb = root.querySelector('.cs__thumb');

  let open = false;
  let drag = null;

  function setOpen(next) {
    open = next;
    root.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      syncThumb();
      // focus panel for Esc support (without stealing tab order too aggressively)
      panel.focus({ preventScroll: true });
    }
  }

  function close() { setOpen(false); }
  function toggle() { setOpen(!open); }

  function setValue(optEl) {
    opts.forEach(o => o.setAttribute('aria-selected', 'false'));
    optEl.setAttribute('aria-selected', 'true');

    const label = optEl.textContent.trim();
    const val = optEl.getAttribute('data-value') || label;

    text.textContent = label;
    root.dataset.hasValue = 'true';
    hidden.value = val;
  }

  function ensureSelectedInView() {
    const sel = root.querySelector('.cs__opt[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  // Thumb sizing/position based on list scroll
  function syncThumb() {
    const view = list.clientHeight;
    const total = list.scrollHeight;
    const trackH = track.clientHeight;

    if (total <= view) {
      thumb.style.height = '0px';
      thumb.style.transform = 'translateY(0px)';
      return;
    }

    const minH = 54;
    const h = Math.max(minH, Math.round((view / total) * trackH));
    const maxTop = trackH - h;
    const top = Math.round((list.scrollTop / (total - view)) * maxTop);

    thumb.style.height = h + 'px';
    thumb.style.transform = `translateY(${top}px)`;
  }

  function scrollByAmount(px) {
    list.scrollBy({ top: px, left: 0, behavior: 'smooth' });
  }

  btn.addEventListener('click', toggle);

  opts.forEach(opt => {
    opt.setAttribute('aria-selected', 'false');
    opt.addEventListener('click', () => {
      setValue(opt);
      close();
      btn.focus();
    });
  });

  // close on outside click
  document.addEventListener('mousedown', (e) => {
    if (!root.contains(e.target)) close();
  });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      btn.focus();
    }
  });

  list.addEventListener('scroll', syncThumb);

  upBtn.addEventListener('click', () => scrollByAmount(-120));
  downBtn.addEventListener('click', () => scrollByAmount(120));

  // drag thumb
  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const rect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    drag = {
      startY: e.clientY,
      startTop: thumbRect.top - rect.top,
      trackH: rect.height,
      thumbH: thumbRect.height
    };
  });

  document.addEventListener('mousemove', (e) => {
    if (!drag) return;

    const total = list.scrollHeight;
    const view = list.clientHeight;
    if (total <= view) return;

    const maxTop = drag.trackH - drag.thumbH;
    let nextTop = drag.startTop + (e.clientY - drag.startY);
    nextTop = Math.max(0, Math.min(maxTop, nextTop));

    const ratio = nextTop / maxTop;
    list.scrollTop = ratio * (total - view);
    syncThumb();
  });

  document.addEventListener('mouseup', () => { drag = null; });

  // initial selection (optional): highlight "Liz the Koala"
  const initial = opts.find(o => (o.getAttribute('data-value') === 'liz'));
  if (initial) setValue(initial);
  // but keep placeholder like in screenshot? comment out previous 2 lines if you want placeholder initially.

  // If you want placeholder initially exactly like on screenshot:
  root.dataset.hasValue = 'false';
  text.textContent = text.dataset.placeholder;

  // when open, keep selected in view
  const obs = new MutationObserver(() => {
    if (root.classList.contains('is-open')) {
      ensureSelectedInView();
      syncThumb();
    }
  });
  obs.observe(root, { attributes: true, attributeFilter: ['class'] });
})();