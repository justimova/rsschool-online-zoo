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

document.querySelectorAll('.meet-pets .card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if ((e.target as Element)?.closest('a, button')) return;

    const a = card.querySelector('a[href]');
    if (!a) return;

    window.location.href = a.href;
  });

  card.style.cursor = 'pointer';
});

document.querySelectorAll('.favourite .card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a, button')) return;

    const a = card.querySelector('a[href]');
    if (!a) return;

    window.location.href = a.href;
  });

  card.style.cursor = 'pointer';
});

const careModal = document.getElementById('care-modal');

function closeCareModal(): void {
  if (!careModal) return;
  careModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (careModal) {
  careModal.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close-modal]')) {
      closeCareModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !careModal.hasAttribute('hidden')) {
      closeCareModal();
    }
  });
}

const donationModal = document.getElementById('donation-modal');

function closeDonationModal(): void {
  if (!donationModal) return;
  donationModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (donationModal) {
  donationModal.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close-modal]')) {
      closeDonationModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !donationModal.hasAttribute('hidden')) {
      closeDonationModal();
    }
  });
}

const donation2Modal = document.getElementById('donation2-modal');

function closeDonation2Modal(): void {
  if (!donation2Modal) return;
  donation2Modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (donation2Modal) {
  donation2Modal.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close-modal]')) {
      closeDonation2Modal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !donation2Modal.hasAttribute('hidden')) {
      closeDonation2Modal();
    }
  });
}

const donation3Modal = document.getElementById('donation3-modal');

function closeDonation3Modal(): void {
  if (!donation3Modal) return;
  donation3Modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

if (donation3Modal) {
  donation3Modal.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-close-modal]')) {
      closeDonation3Modal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !donation3Modal.hasAttribute('hidden')) {
      closeDonation3Modal();
    }
  });
}


document.addEventListener('click', (e) => {
  const opener = (e.target as Element).closest('[data-open-modal]');
  if (!opener) return;

  e.preventDefault();

  const id = opener.getAttribute('data-open-modal');
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
});

document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest('[data-next-modal]');
  if (!btn) return;

  e.preventDefault();

  const nextId = btn.getAttribute('data-next-modal');
  const nextModal = document.getElementById(nextId ?? '');
  if (!nextModal) return;

  const parentModal = btn.closest('.modal');
  if (parentModal) parentModal.setAttribute('hidden', '');


  nextModal.removeAttribute('hidden');


  document.body.style.overflow = 'hidden';
});







(function (): void {
  const root = document.getElementById('favSelect');
  const btn = root?.querySelector('.cs__btn');
  const text = root?.querySelector('.cs__text');
  const panel = root?.querySelector('.cs__panel');
  const list = root?.querySelector('.cs__list');
  const opts = Array.from(root?.querySelectorAll('.cs__opt'));
  const hidden = root?.querySelector('input[type="hidden"]');

  const upBtn = root?.querySelector('.cs__scroll-up');
  const downBtn = root?.querySelector('.cs__scroll-down');
  const track = root?.querySelector('.cs__track');
  const thumb = root?.querySelector('.cs__thumb');

  let open = false;
  let drag = null;

  function setOpen(next): void {
    open = next;
    root?.classList.toggle('is-open', open);
    btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      syncThumb();
      panel?.focus({ preventScroll: true });
    }
  }

  function close(): void { setOpen(false); }
  function toggle(): void { setOpen(!open); }

  function setValue(optEl): void {
    opts.forEach(o => o.setAttribute('aria-selected', 'false'));
    optEl.setAttribute('aria-selected', 'true');

    const label = optEl.textContent.trim();
    const val = optEl.getAttribute('data-value') || label;

    if (text)
      text.textContent = label;
    if (root)
      root.dataset.hasValue = 'true';
    if (hidden)
      hidden.value = val;
  }

  function ensureSelectedInView(): void {
    const sel = root?.querySelector('.cs__opt[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function syncThumb(): void {
    const view = list?.clientHeight ?? 0;
    const total = list?.scrollHeight ?? 0;
    const trackH = track?.clientHeight ?? 0;

    if (total <= view && thumb) {
      thumb.style.height = '0px';
      thumb.style.transform = 'translateY(0px)';
      return;
    }

    const minH = 54;
    const h = Math.max(minH, Math.round((view / total) * trackH));
    const maxTop = trackH - h;
    const top = Math.round((list?.scrollTop ?? 0 / (total - view)) * maxTop);

    if (thumb) {
      thumb.style.height = h + 'px';
      thumb.style.transform = `translateY(${top}px)`;
    }
  }

  function scrollByAmount(px): void {
    list?.scrollBy({ top: px, left: 0, behavior: 'smooth' });
  }

  btn?.addEventListener('click', toggle);

  opts.forEach(opt => {
    opt.setAttribute('aria-selected', 'false');
    opt.addEventListener('click', () => {
      setValue(opt);
      close();
      btn?.focus();
    });
  });

  // close on outside click
  document.addEventListener('mousedown', (e) => {
    if (!root?.contains(e.target))
      close();
  });

  // keyboard
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      btn?.focus();
    }
  });

  list?.addEventListener('scroll', syncThumb);

  upBtn?.addEventListener('click', () => scrollByAmount(-120));
  downBtn?.addEventListener('click', () => scrollByAmount(120));

  // drag thumb
  thumb?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const rect = track?.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    drag = {
      startY: e.clientY,
      startTop: thumbRect.top - (rect?.top ?? 0),
      trackH: rect?.height,
      thumbH: thumbRect.height
    };
  });

  document.addEventListener('mousemove', (e) => {
    if (!drag) return;

    const total = list?.scrollHeight ?? 0;
    const view = list?.clientHeight ?? 0;
    if (total <= view) return;

    const maxTop = drag.trackH - drag.thumbH;
    let nextTop = drag.startTop + (e.clientY - drag.startY);
    nextTop = Math.max(0, Math.min(maxTop, nextTop));

    const ratio = nextTop / maxTop;
    if (list)
      list.scrollTop = ratio * (total - view);
    syncThumb();
  });

  document.addEventListener('mouseup', () => { drag = null; });

  const initial = opts.find(o => (o.getAttribute('data-value') === 'liz'));
  if (initial) setValue(initial);

  if (root)
    root.dataset.hasValue = 'false';
  if (text)
    text.textContent = text.dataset.placeholder;

  // when open, keep selected in view
  const obs = new MutationObserver(() => {
    if (root?.classList.contains('is-open')) {
      ensureSelectedInView();
      syncThumb();
    }
  });
  obs.observe(root, { attributes: true, attributeFilter: ['class'] });
})();
