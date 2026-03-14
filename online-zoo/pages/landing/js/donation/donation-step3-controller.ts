import type { IAuthStorage } from "../../../../src/shared/app/services/auth-storage";
import type { IDonationCardStorage } from "../../../../src/shared/app/services/donation-card-storage";
import type { ICreateDonationPayload, IDonationResponse, IDonationService } from "../../../../src/shared/app/services/donation.service";
import type { IUser } from "../../../../src/shared/auth/auth.types";
import type { IStoredDonationCard } from "../../../../src/shared/auth/card.types";
import { DonationResultModalController } from "./donation-result-modal-controller";
import { MODAL_OPENED_EVENT, type ModalOpenedDetail, type DonationStep3Data } from "./types";
import { DonationStep1Store } from "./donation-store";
import { DonationStep2Store } from "./donation-store";


export class DonationStep3Validator {
  private static readonly cardNumberPattern = /^\d{16}$/;
  private static readonly cvvPattern = /^\d{3}$/;
  private static readonly monthPattern = /^(0[1-9]|1[0-2])$/;
  private static readonly yearPattern = /^\d{2}$/;

  public static normalizeDigits(value: string, maxLength: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }

  public static isValidCardNumber(value: string): boolean {
    return this.cardNumberPattern.test(value.trim());
  }

  public static isValidCvv(value: string): boolean {
    return this.cvvPattern.test(value.trim());
  }

  public static isValidExpiration(month: string, year: string): boolean {
    const normalizedMonth = month.trim();
    const normalizedYear = year.trim();

    if (!this.monthPattern.test(normalizedMonth) || !this.yearPattern.test(normalizedYear)) {
      return false;
    }

    const selectedMonth = Number(normalizedMonth);
    const selectedYear = Number(normalizedYear);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;

    return (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth >= currentMonth)
    );
  }

  public static formatExpiration(month: string, year: string): string {
    return `${month}/${year}`;
  }

  public static applyCardNumberValidity(input: HTMLInputElement): void {
    const value = input.value.trim();

    if (!value) {
      input.setCustomValidity('Enter card number.');
      return;
    }

    if (!this.isValidCardNumber(value)) {
      input.setCustomValidity('Card number must contain exactly 16 digits.');
      return;
    }

    input.setCustomValidity('');
  }

  public static applyCvvValidity(input: HTMLInputElement): void {
    const value = input.value.trim();

    if (!value) {
      input.setCustomValidity('Enter CVV.');
      return;
    }

    if (!this.isValidCvv(value)) {
      input.setCustomValidity('CVV must contain exactly 3 digits.');
      return;
    }

    input.setCustomValidity('');
  }

  public static applyExpirationValidity(
    monthInput: HTMLInputElement,
    yearInput: HTMLInputElement
  ): void {
    const month = monthInput.value.trim();
    const year = yearInput.value.trim();

    monthInput.setCustomValidity('');
    yearInput.setCustomValidity('');

    if (!month && !year) {
      return;
    }

    if (month && !this.monthPattern.test(month)) {
      monthInput.setCustomValidity('Month must be in MM format from 01 to 12.');
      return;
    }

    if (year && !this.yearPattern.test(year)) {
      yearInput.setCustomValidity('Year must be in YY format.');
      return;
    }

    // Пока заполнено только одно поле — не блокируем пользователя ошибкой
    if (!month || !year) {
      return;
    }

    if (!this.isValidExpiration(month, year)) {
      monthInput.setCustomValidity('Expiration date must be in the future.');
    }
  }
}

interface DonationStep3Elements {
  root: HTMLElement;
  cardNumberInput: HTMLInputElement;
  cvvInput: HTMLInputElement;
  // monthSelect: HTMLElement;
  // monthText: HTMLElement;
  // monthList: HTMLUListElement;
  // monthValueInput: HTMLInputElement;
  // yearSelect: HTMLElement;
  // yearText: HTMLElement;
  // yearList: HTMLUListElement;
  // yearValueInput: HTMLInputElement;
  expirationMonthInput: HTMLInputElement;
  expirationYearInput: HTMLInputElement;
  saveCardField: HTMLElement;
  saveCardCheckbox: HTMLInputElement;
  savedCardsField: HTMLElement;
  savedCardsSelect: HTMLElement;
  savedCardsText: HTMLElement;
  savedCardsList: HTMLUListElement;
  savedCardsValueInput: HTMLInputElement;
  completeButton: HTMLAnchorElement;
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

export class DonationStep3Controller {
  private readonly elements: DonationStep3Elements;
  private readonly savedCardsPlaceholder: string;
  // private readonly monthPlaceholder: string;
  // private readonly yearPlaceholder: string;
  private savedCards: IStoredDonationCard[] = [];
  private isSubmitting = false;

  public constructor(
    private readonly root: HTMLElement,
    private readonly authStorage: IAuthStorage,
    private readonly donationCardStorage: IDonationCardStorage,
    private readonly donationService: IDonationService,
    private readonly donationResultModalController: DonationResultModalController,
  ) {
    this.elements = this.collectElements(root);
    this.savedCardsPlaceholder = this.elements.savedCardsText.dataset.placeholder?.trim() ?? '';
    // this.monthPlaceholder = this.elements.monthText.dataset.placeholder?.trim() ?? '';
    // this.yearPlaceholder = this.elements.yearText.dataset.placeholder?.trim() ?? '';
  }

  public init(): void {
    // this.renderMonthOptions();
    // this.renderYearOptions();
    this.refreshAuthenticatedState();
    this.bindEvents();
    this.bindModalOpenEvent();
    this.updateState();
  }

  private buildDonationPayload(): ICreateDonationPayload | null {
    const step1Data = DonationStep1Store.get();
    const step2Data = DonationStep2Store.get();
    const step3Data = this.getFormData();

    if (!step1Data || !step2Data || !step3Data) {
      return null;
    }

    return {
      petId: step1Data.petId,
      amount: step1Data.amount,
      name: step2Data.name,
      email: step2Data.email,
    };
  }

  private buildSuccessMessage(response: IDonationResponse): string {
    if (!response) {
      return 'Thank you for your donation!';
    }

    return response.data.message;
  }

  private setSubmittingState(isSubmitting: boolean): void {
    this.isSubmitting = isSubmitting;

    this.elements.completeButton.classList.toggle('is-loading', isSubmitting);
    this.elements.completeButton.setAttribute('aria-disabled', String(isSubmitting || this.getFormData() === null));
    this.elements.completeButton.tabIndex = isSubmitting ? -1 : (this.getFormData() ? 0 : -1);
    this.elements.completeButton.textContent = isSubmitting ? 'processing...' : 'complete donation';
  }

  private showValidationErrors(): void {
    DonationStep3Validator.applyCardNumberValidity(this.elements.cardNumberInput);
    DonationStep3Validator.applyCvvValidity(this.elements.cvvInput);
    DonationStep3Validator.applyExpirationValidity(
      this.elements.expirationMonthInput,
      this.elements.expirationYearInput
    );

    if (!this.elements.cardNumberInput.checkValidity()) {
      this.elements.cardNumberInput.reportValidity();
      return;
    }

    if (!this.elements.cvvInput.checkValidity()) {
      this.elements.cvvInput.reportValidity();
      return;
    }

    if (!this.elements.expirationMonthInput.checkValidity()) {
      this.elements.expirationMonthInput.reportValidity();
      return;
    }

    if (!this.elements.expirationYearInput.checkValidity()) {
      this.elements.expirationYearInput.reportValidity();
    }
  }

  private closeDonationFlow(): void {
    const openedModals = Array.from(document.querySelectorAll('.modal:not([hidden])')) as HTMLElement[];

    openedModals.forEach((modal) => {
      modal.setAttribute('hidden', '');
    });
  }

  private saveCardIfNeeded(formData: DonationStep3Data): void {
    const user = this.getAuthenticatedUser();

    if (!user || !this.elements.saveCardCheckbox.checked) {
      return;
    }

    this.donationCardStorage.saveCard(user.login, formData);
    this.savedCards = this.donationCardStorage.getCards(user.login);
    this.renderSavedCards(this.savedCards);
  }

  private bindModalOpenEvent(): void {
    document.addEventListener(MODAL_OPENED_EVENT, (event) => {
      const customEvent = event as CustomEvent<ModalOpenedDetail>;

      if (customEvent.detail.modalId !== 'donation3-modal') {
        return;
      }

      this.onModalOpen();
    });
  }

  private onModalOpen(): void {
    this.refreshAuthenticatedState();
    this.updateState();
  }

  public refreshAuthenticatedState(): void {
    const user = this.getAuthenticatedUser();

    if (!user) {
      this.elements.saveCardField.hidden = true;
      this.elements.savedCardsField.hidden = true;
      this.savedCards = [];
      return;
    }

    this.elements.saveCardField.hidden = false;

    this.savedCards = this.donationCardStorage.getCards(user.login);
    this.renderSavedCards(this.savedCards);
  }

  private collectElements(root: HTMLElement): DonationStep3Elements {
    return {
      root,
      cardNumberInput: queryRequired<HTMLInputElement>(
        root,
        '#donation3-card-number',
        'Step 3 card number input not found'
      ),
      cvvInput: queryRequired<HTMLInputElement>(
        root,
        '#donation3-cvv',
        'Step 3 CVV input not found'
      ),
      expirationMonthInput: queryRequired<HTMLInputElement>(
        root,
        '#donation3-exp-month',
        'Step 3 expiration month input not found'
      ),
      expirationYearInput: queryRequired<HTMLInputElement>(
        root,
        '#donation3-exp-year',
        'Step 3 expiration year input not found'
      ),
      saveCardField: queryRequired<HTMLElement>(
        root,
        '#donation3-save-card-field',
        'Step 3 save card field not found'
      ),
      saveCardCheckbox: queryRequired<HTMLInputElement>(
        root,
        '#donation3-save-card',
        'Step 3 save card checkbox not found'
      ),
      savedCardsField: queryRequired<HTMLElement>(
        root,
        '#donation3-saved-cards-field',
        'Step 3 saved cards field not found'
      ),
      savedCardsSelect: queryRequired<HTMLElement>(
        root,
        '#donation3-saved-card-select',
        'Step 3 saved cards select not found'
      ),
      savedCardsText: queryRequired<HTMLElement>(
        root,
        '#donation3-saved-card-select .cs__text',
        'Step 3 saved cards text not found'
      ),
      savedCardsList: queryRequired<HTMLUListElement>(
        root,
        '#donation3-saved-card-list',
        'Step 3 saved cards list not found'
      ),
      savedCardsValueInput: queryRequired<HTMLInputElement>(
        root,
        '#donation3-saved-card-value',
        'Step 3 saved cards value input not found'
      ),
      completeButton: queryRequired<HTMLAnchorElement>(
        root,
        '#donation3-complete',
        'Step 3 complete button not found'
      ),
    };
  }

  private bindEvents(): void {
    this.bindCardNumberEvents();
    this.bindCvvEvents();
    this.bindExpirationEvents();
    this.bindSavedCardsEvents();
    this.bindCompleteDonationEvent();
  }

  private bindExpirationEvents(): void {
    this.elements.expirationMonthInput.addEventListener('input', () => {
      this.elements.expirationMonthInput.value = DonationStep3Validator.normalizeDigits(
        this.elements.expirationMonthInput.value,
        2
      );

      this.updateState();
    });

    this.elements.expirationYearInput.addEventListener('input', () => {
      this.elements.expirationYearInput.value = DonationStep3Validator.normalizeDigits(
        this.elements.expirationYearInput.value,
        2
      );

      this.updateState();
    });

    this.elements.expirationMonthInput.addEventListener('blur', () => {
      DonationStep3Validator.applyExpirationValidity(
        this.elements.expirationMonthInput,
        this.elements.expirationYearInput
      );
    });

    this.elements.expirationYearInput.addEventListener('blur', () => {
      DonationStep3Validator.applyExpirationValidity(
        this.elements.expirationMonthInput,
        this.elements.expirationYearInput
      );
    });
  }

  private bindCardNumberEvents(): void {
    this.elements.cardNumberInput.addEventListener('input', () => {
      this.elements.cardNumberInput.value = DonationStep3Validator.normalizeDigits(
        this.elements.cardNumberInput.value,
        16
      );

      DonationStep3Validator.applyCardNumberValidity(this.elements.cardNumberInput);
      this.updateState();
    });

    this.elements.cardNumberInput.addEventListener('blur', () => {
      DonationStep3Validator.applyCardNumberValidity(this.elements.cardNumberInput);
      this.elements.cardNumberInput.reportValidity();
    });
  }

  private bindCvvEvents(): void {
    this.elements.cvvInput.addEventListener('input', () => {
      this.elements.cvvInput.value = DonationStep3Validator.normalizeDigits(
        this.elements.cvvInput.value,
        3
      );

      DonationStep3Validator.applyCvvValidity(this.elements.cvvInput);
      this.updateState();
    });

    this.elements.cvvInput.addEventListener('blur', () => {
      DonationStep3Validator.applyCvvValidity(this.elements.cvvInput);
      this.elements.cvvInput.reportValidity();
    });
  }

  // private bindExpirationEvents(): void {
  //   this.elements.monthList.addEventListener('click', (event) => {
  //     const target = event.target as Element;
  //     const option = target.closest('.cs__opt') as HTMLElement | null;

  //     if (!option) {
  //       return;
  //     }

  //     const month = option.dataset.value ?? '';
  //     const label = option.textContent?.trim() ?? '';

  //     if (!month || !label) {
  //       return;
  //     }

  //     this.applyMonthSelection(month, label);
  //   });

  //   this.elements.yearList.addEventListener('click', (event) => {
  //     const target = event.target as Element;
  //     const option = target.closest('.cs__opt') as HTMLElement | null;

  //     if (!option) {
  //       return;
  //     }

  //     const year = option.dataset.value ?? '';
  //     const label = option.textContent?.trim() ?? '';

  //     if (!year || !label) {
  //       return;
  //     }

  //     this.applyYearSelection(year, label);
  //   });
  // }

  private bindSavedCardsEvents(): void {
    this.elements.savedCardsList.addEventListener('click', (event) => {
      const target = event.target as Element;
      const option = target.closest('.cs__opt') as HTMLElement | null;

      if (!option) {
        return;
      }

      const cardId = option.dataset.cardId ?? '';
      const selectedCard = this.savedCards.find((card) => card.id === cardId);

      if (!selectedCard) {
        return;
      }

      this.applySavedCardSelection(selectedCard);
    });
  }

  private bindCompleteDonationEvent(): void {
    this.elements.completeButton.addEventListener('click', async (event) => {
      event.preventDefault();

      if (this.isSubmitting) {
        return;
      }

      const payload = this.buildDonationPayload();

      if (!payload) {
        this.showValidationErrors();
        return;
      }

      try {
        this.setSubmittingState(true);

        const response: IDonationResponse = await this.donationService.completeDonation(payload);

        const formData = this.getFormData();
        if (formData) {
          this.saveCardIfNeeded(formData);
        }

        this.closeDonationFlow();

        this.donationResultModalController.showSuccess(
          this.buildSuccessMessage(response)
        );
      } catch (error: unknown) {
        this.donationResultModalController.showError(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        this.setSubmittingState(false);
        this.updateState();
      }
    });
  }

  // private renderMonthOptions(): void {
  //   this.elements.monthList.innerHTML = '';

  //   const fragment = document.createDocumentFragment();

  //   for (let month = 1; month <= 12; month += 1) {
  //     const value = String(month).padStart(2, '0');
  //     const option = document.createElement('li');

  //     option.className = 'cs__opt';
  //     option.setAttribute('role', 'option');
  //     option.setAttribute('tabindex', '-1');
  //     option.dataset.value = value;
  //     option.textContent = value;

  //     fragment.appendChild(option);
  //   }

  //   this.elements.monthList.appendChild(fragment);
  // }

  // private renderYearOptions(): void {
  //   this.elements.yearList.innerHTML = '';

  //   const fragment = document.createDocumentFragment();
  //   const currentYear = new Date().getFullYear() % 100;

  //   for (let offset = 0; offset < 15; offset += 1) {
  //     const value = String(currentYear + offset).padStart(2, '0');
  //     const option = document.createElement('li');

  //     option.className = 'cs__opt';
  //     option.setAttribute('role', 'option');
  //     option.setAttribute('tabindex', '-1');
  //     option.dataset.value = value;
  //     option.textContent = value;

  //     fragment.appendChild(option);
  //   }

  //   this.elements.yearList.appendChild(fragment);
  // }

  private renderSavedCards(cards: IStoredDonationCard[]): void {
    this.elements.savedCardsList.innerHTML = '';

    if (cards.length === 0) {
      this.elements.savedCardsField.hidden = true;
      this.elements.savedCardsValueInput.value = '';
      this.elements.savedCardsText.textContent = this.savedCardsPlaceholder;
      this.elements.savedCardsSelect.dataset.hasValue = 'false';
      return;
    }

    this.elements.savedCardsField.hidden = false;

    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
      const option = document.createElement('li');

      option.className = 'cs__opt';
      option.setAttribute('role', 'option');
      option.setAttribute('tabindex', '-1');
      option.dataset.cardId = card.id;
      option.textContent = card.displayName;

      fragment.appendChild(option);
    });

    this.elements.savedCardsList.appendChild(fragment);
  }

  // private applyMonthSelection(month: string, label: string): void {
  //   this.elements.monthValueInput.value = month;
  //   this.elements.monthText.textContent = label;
  //   this.elements.monthSelect.dataset.hasValue = 'true';

  //   this.updateState();
  // }

  // private applyYearSelection(year: string, label: string): void {
  //   this.elements.yearValueInput.value = year;
  //   this.elements.yearText.textContent = label;
  //   this.elements.yearSelect.dataset.hasValue = 'true';

  //   this.updateState();
  // }

  private applySavedCardSelection(card: IStoredDonationCard): void {
    this.elements.savedCardsValueInput.value = card.id;
    this.elements.savedCardsText.textContent = card.displayName;
    this.elements.savedCardsSelect.dataset.hasValue = 'true';

    this.elements.cardNumberInput.value = card.cardNumber;
    this.elements.cvvInput.value = card.cvv;
    this.elements.expirationMonthInput.value = card.expirationMonth;
    this.elements.expirationYearInput.value = card.expirationYear;

    this.updateState();
  }

  private getAuthenticatedUser(): IUser | null {
    if (!this.authStorage.isAuthenticated) {
      return null;
    }

    return this.authStorage.getUser();
  }

  private getFormData(): DonationStep3Data | null {
    const cardNumber = this.elements.cardNumberInput.value.trim();
    const cvv = this.elements.cvvInput.value.trim();
    const expirationMonth = this.elements.expirationMonthInput.value.trim();
    const expirationYear = this.elements.expirationYearInput.value.trim();

    if (!DonationStep3Validator.isValidCardNumber(cardNumber)) {
      return null;
    }

    if (!DonationStep3Validator.isValidCvv(cvv)) {
      return null;
    }

    if (!DonationStep3Validator.isValidExpiration(expirationMonth, expirationYear)) {
      return null;
    }

    return {
      cardNumber,
      cvv,
      expirationMonth,
      expirationYear,
      expirationDate: DonationStep3Validator.formatExpiration(expirationMonth, expirationYear),
    };
  }

  private updateCompleteButtonState(): void {
    const isEnabled = this.getFormData() !== null && !this.isSubmitting;

    this.elements.completeButton.setAttribute('aria-disabled', String(!isEnabled));
    this.elements.completeButton.tabIndex = isEnabled ? 0 : -1;
    this.elements.completeButton.classList.toggle('is-disabled', !isEnabled);
  }

  private updateState(): void {
    DonationStep3Validator.applyCardNumberValidity(this.elements.cardNumberInput);
    DonationStep3Validator.applyCvvValidity(this.elements.cvvInput);
    DonationStep3Validator.applyExpirationValidity(
      this.elements.expirationMonthInput,
      this.elements.expirationYearInput
    );

    this.updateCompleteButtonState();
  }
}
