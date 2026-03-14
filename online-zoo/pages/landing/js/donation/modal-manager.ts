import { DonationStep1Store } from "./donation-store";
import type { ModalOpenedDetail } from "./types";
import { DONATION_STEP_1_EVENT, MODAL_OPENED_EVENT } from "./types";

export function queryRequired<T extends Element>(
  root: ParentNode,
  selector: string,
  errorMessage: string
): T {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(errorMessage);
  }

  return element as T;
}

export function queryAll<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll(selector)) as T[];
}

export function findRowByLabel(root: ParentNode, labelText: string): HTMLElement {
  const rows = queryAll<HTMLElement>(root, '.form-field.row');
  const row = rows.find((item) => {
    const text = item.querySelector('.toggle-ui')?.textContent?.trim().toLowerCase() ?? '';
    return text === labelText.toLowerCase();
  });

  if (!row) {
    throw new Error(`Row with label "${labelText}" not found`);
  }

  return row;
}

export class ModalManager {
  constructor(private readonly root: Document = document) {}

  init(): void {
    this.bindClickEvents();
    this.bindEscapeEvent();
  }

  private bindClickEvents(): void {
  this.root.addEventListener('click', (event) => {
    const target = event.target as Element;

    const closeButton = target.closest('[data-close-modal]') as HTMLElement | null;
    if (closeButton) {
      if (closeButton.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return;
      }

      const modal = closeButton.closest('.modal') as HTMLElement | null;

      if (modal) {
        event.preventDefault();
        this.close(modal);
      }

      return;
    }

    const openButton = target.closest('[data-open-modal]');
    if (openButton) {
      event.preventDefault();

      const modalId = openButton.getAttribute('data-open-modal');
      if (modalId) {
        this.openById(modalId);
      }

      return;
    }

    const nextButton = target.closest('[data-next-modal]') as HTMLAnchorElement | null;
    if (nextButton) {
      this.handleNextClick(event, nextButton);
    }
  });
}

  private bindEscapeEvent(): void {
    this.root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      const openedModal = this.root.querySelector('.modal:not([hidden])') as HTMLElement | null;
      if (!openedModal) {
        return;
      }

      this.close(openedModal);
    });
  }

  private handleNextClick(event: Event, button: HTMLAnchorElement): void {
    if (button.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const parentModal = button.closest('.modal') as HTMLElement | null;
    const nextModalId = button.getAttribute('data-next-modal');
    const nextModal = nextModalId ? document.getElementById(nextModalId) : null;

    if (!nextModal) {
      return;
    }

    if (parentModal) {
      this.close(parentModal, false);
    }

    nextModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    document.dispatchEvent(
      new CustomEvent<ModalOpenedDetail>(MODAL_OPENED_EVENT, {
        detail: {
          modalId: nextModalId ?? '',
          modal: nextModal,
        },
      })
    );

    document.dispatchEvent(
      new CustomEvent(DONATION_STEP_1_EVENT, {
        detail: DonationStep1Store.get(),
      })
    );
  }
  // private handleNextClick(event: Event, button: HTMLAnchorElement): void {
  //   if (button.getAttribute('aria-disabled') === 'true') {
  //     event.preventDefault();
  //     return;
  //   }

  //   event.preventDefault();

  //   const parentModal = button.closest('.modal') as HTMLElement | null;
  //   const nextModalId = button.getAttribute('data-next-modal');
  //   const nextModal = nextModalId ? document.getElementById(nextModalId) : null;

  //   if (!nextModal) {
  //     return;
  //   }

  //   if (parentModal) {
  //     this.close(parentModal, false);
  //   }

  //   nextModal.removeAttribute('hidden');
  //   document.body.style.overflow = 'hidden';

  //   document.dispatchEvent(
  //     new CustomEvent<DonationStep1Data | null>(DONATION_STEP_1_EVENT, {
  //       detail: DonationStep1Store.get(),
  //     })
  //   );
  // }

  private openById(modalId: string): void {
    const modal = document.getElementById(modalId);

    if (!modal) {
      return;
    }

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    document.dispatchEvent(
      new CustomEvent<ModalOpenedDetail>(MODAL_OPENED_EVENT, {
        detail: {
          modalId,
          modal,
        },
      })
    );
  }

  // private openById(modalId: string): void {
  //   const modal = document.getElementById(modalId);

  //   if (!modal) {
  //     return;
  //   }

  //   modal.removeAttribute('hidden');
  //   document.body.style.overflow = 'hidden';
  // }

  private close(modal: HTMLElement, unlockBody = true): void {
    modal.setAttribute('hidden', '');

    if (unlockBody) {
      document.body.style.overflow = '';
    }
  }
}

