import type { IAuthStorage } from "../../../../src/shared/app/services/auth-storage";
import type { IUser } from "../../../../src/shared/auth/auth.types";
import { DonationStep2Store } from "./donation-store";
import type { DonationStep2Data } from "./types";

export class DonationStep2Validator {
  private static readonly namePattern = /^\p{L}+(?:\s+\p{L}+)*$/u;
  private static readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static isValidName(value: string): boolean {
    const normalized = value.trim();

    if (!normalized) {
      return false;
    }

    return this.namePattern.test(normalized);
  }

  public static isValidEmail(value: string): boolean {
    const normalized = value.trim();

    if (!normalized) {
      return false;
    }

    return this.emailPattern.test(normalized);
  }

  public static applyNameValidity(input: HTMLInputElement): void {
    const value = input.value.trim();

    if (!value) {
      input.setCustomValidity('Enter your name.');
      return;
    }

    if (!this.isValidName(value)) {
      input.setCustomValidity(
        'Name should contain only letters and spaces.'
      );
      return;
    }

    input.setCustomValidity('');
  }

  public static applyEmailValidity(input: HTMLInputElement): void {
    const value = input.value.trim();

    if (!value) {
      input.setCustomValidity('Enter your email.');
      return;
    }

    if (!this.isValidEmail(value)) {
      input.setCustomValidity('Enter a valid email address.');
      return;
    }

    input.setCustomValidity('');
  }
}

interface DonationStep2Elements {
  root: HTMLElement;
  nameInput: HTMLInputElement;
  emailInput: HTMLInputElement;
  nextButton: HTMLAnchorElement;
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

export class DonationStep2Controller {
  private readonly elements: DonationStep2Elements;

  public constructor(
    private readonly root: HTMLElement,
    private readonly authStorage: IAuthStorage
  ) {
    this.elements = this.collectElements(root);
  }

  public init(): void {
    this.prefillForm();
    this.bindEvents();
    this.updateState();
  }

  private collectElements(root: HTMLElement): DonationStep2Elements {
    return {
      root,
      nameInput: queryRequired<HTMLInputElement>(
        root,
        '#donation2-name',
        'Step 2 name input not found'
      ),
      emailInput: queryRequired<HTMLInputElement>(
        root,
        '#donation2-email',
        'Step 2 email input not found'
      ),
      nextButton: queryRequired<HTMLAnchorElement>(
        root,
        '[data-next-modal="donation3-modal"]',
        'Step 2 next button not found'
      ),
    };
  }

  private prefillForm(): void {
    const savedData = DonationStep2Store.get();

    if (savedData) {
      this.elements.nameInput.value = savedData.name;
      this.elements.emailInput.value = savedData.email;
      return;
    }

    if (!this.authStorage.isAuthenticated) {
      return;
    }

    const user: IUser | null = this.authStorage.getUser();

    if (!user) {
      return;
    }

    this.elements.nameInput.value = user.name ?? '';
    this.elements.emailInput.value = user.email ?? '';
  }

  private bindEvents(): void {
    this.bindNameEvents();
    this.bindEmailEvents();
  }

  private bindNameEvents(): void {
    this.elements.nameInput.addEventListener('input', () => {
      DonationStep2Validator.applyNameValidity(this.elements.nameInput);
      this.updateState();
    });

    this.elements.nameInput.addEventListener('blur', () => {
      DonationStep2Validator.applyNameValidity(this.elements.nameInput);
      this.elements.nameInput.reportValidity();
    });
  }

  private bindEmailEvents(): void {
    this.elements.emailInput.addEventListener('input', () => {
      DonationStep2Validator.applyEmailValidity(this.elements.emailInput);
      this.updateState();
    });

    this.elements.emailInput.addEventListener('blur', () => {
      DonationStep2Validator.applyEmailValidity(this.elements.emailInput);
      this.elements.emailInput.reportValidity();
    });
  }

  private getFormData(): DonationStep2Data | null {
    const name = this.elements.nameInput.value.trim();
    const email = this.elements.emailInput.value.trim();

    if (!DonationStep2Validator.isValidName(name)) {
      return null;
    }

    if (!DonationStep2Validator.isValidEmail(email)) {
      return null;
    }

    return {
      name,
      email,
    };
  }

  private updateNextButtonState(): void {
    const isEnabled = this.getFormData() !== null;

    this.elements.nextButton.setAttribute('aria-disabled', String(!isEnabled));
    this.elements.nextButton.tabIndex = isEnabled ? 0 : -1;
    this.elements.nextButton.classList.toggle('is-disabled', !isEnabled);
  }

  private persistState(): void {
    DonationStep2Store.set(this.getFormData());
  }

  private updateState(): void {
    DonationStep2Validator.applyNameValidity(this.elements.nameInput);
    DonationStep2Validator.applyEmailValidity(this.elements.emailInput);

    this.updateNextButtonState();
    this.persistState();
  }
}
