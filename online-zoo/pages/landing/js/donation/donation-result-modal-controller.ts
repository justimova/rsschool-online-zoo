type DonationResultStatus = 'success' | 'error';

interface DonationResultModalElements {
  root: HTMLElement;
  title: HTMLElement;
  message: HTMLElement;
}

function queryRequired<T extends Element>(
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

export class DonationResultModalController {
  private readonly elements: DonationResultModalElements;

  public constructor(private readonly root: HTMLElement) {
    this.elements = this.collectElements(root);
  }

  public showSuccess(message: string): void {
    this.show({
      status: 'success',
      title: 'Thank you!',
      message,
    });
  }

  public showError(message: string): void {
    this.show({
      status: 'error',
      title: 'Donation failed',
      message,
    });
  }

  private collectElements(root: HTMLElement): DonationResultModalElements {
    return {
      root,
      title: queryRequired<HTMLElement>(
        root,
        '#donation-result-title',
        'Donation result title not found'
      ),
      message: queryRequired<HTMLElement>(
        root,
        '#donation-result-message',
        'Donation result message not found'
      ),
    };
  }

  private show(config: {
    status: DonationResultStatus;
    title: string;
    message: string;
  }): void {
    this.root.classList.remove('donation-result-modal--success', 'donation-result-modal--error');
    this.root.classList.add(`donation-result-modal--${config.status}`);

    this.elements.title.textContent = config.title;
    this.elements.message.textContent = config.message;

    this.root.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }
}
