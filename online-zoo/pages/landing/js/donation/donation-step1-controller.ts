import type { IAnimalService } from "../../../../src/shared/app/services/animal.service";
import { createAnimalService } from "../../../../src/shared/app/services/animal.service";
import type { IAnimal } from "../../../../src/shared/auth/animal.types";
import { DonationStep1Store } from "./donation-store";
import { findRowByLabel, queryAll, queryRequired } from "./modal-manager";
import type { DonationStep1Data, SelectedAmount, SelectedPet } from "./types";

interface DonationModalElements {
  root: HTMLElement;
  nextButton: HTMLAnchorElement;
  presetAmountCheckboxes: HTMLInputElement[];
  otherAmountCheckbox: HTMLInputElement;
  otherAmountInput: HTMLInputElement;
  petCheckbox: HTMLInputElement;
  petHiddenInput: HTMLInputElement;
  petText: HTMLElement;
  petSelect: HTMLElement;
  petList: HTMLUListElement;
  recurringCheckbox: HTMLInputElement;
}

export class DonationStep1Controller {
  private readonly elements: DonationModalElements;
  private readonly petPlaceholder: string;

  public constructor(
    private readonly root: HTMLElement,
    private readonly animalService: IAnimalService
  ) {
    this.elements = this.collectElements(root);
    this.petPlaceholder = this.elements.petText.dataset.placeholder?.trim() ?? '';
    this.animalService = createAnimalService();
  }

  public async init(): Promise<void> {
    await this.loadPets();

    this.applyDefaultState();
    this.bindEvents();
    this.updateState();
  }

  private collectElements(root: HTMLElement): DonationModalElements {
    const otherAmountRow = findRowByLabel(root, 'Other amount');

    return {
      root,
      nextButton: queryRequired<HTMLAnchorElement>(
        root,
        '[data-next-modal]',
        'Next button not found'
      ),
      presetAmountCheckboxes: queryAll<HTMLInputElement>(
        root,
        '.form-field.radio .toggle input[type="checkbox"]'
      ),
      otherAmountCheckbox: queryRequired<HTMLInputElement>(
        otherAmountRow,
        '.toggle input[type="checkbox"]',
        'Other amount checkbox not found'
      ),
      otherAmountInput: queryRequired<HTMLInputElement>(
        otherAmountRow,
        'input[type="text"]',
        'Other amount input not found'
      ),
      petCheckbox: queryRequired<HTMLInputElement>(
        root,
        '.form-field.row.special .toggle input[type="checkbox"]',
        'Pet checkbox not found'
      ),
      petHiddenInput: queryRequired<HTMLInputElement>(
        root,
        'input[name="favourite"]',
        'Pet hidden input not found'
      ),
      petText: queryRequired<HTMLElement>(
        root,
        '#favSelect .cs__text',
        'Pet select text not found'
      ),
      petSelect: queryRequired<HTMLElement>(
        root,
        '#favSelect',
        'Pet select container not found'
      ),
      petList: queryRequired<HTMLUListElement>(
        root,
        '#special-pet',
        'Pet list not found'
      ),
      recurringCheckbox: queryRequired<HTMLInputElement>(
        root,
        '.cb__input',
        'Recurring checkbox not found'
      ),
    };
  }

  private async loadPets(): Promise<void> {
    const response = await this.animalService.getAnimals();
    this.renderPets(response.data);
  }

  private renderPets(pets: IAnimal[]): void {
    this.elements.petList.innerHTML = '';

    const fragment = document.createDocumentFragment();

    pets.forEach((pet) => {
      const option = document.createElement('li');

      option.className = 'cs__opt';
      option.setAttribute('role', 'option');
      option.setAttribute('tabindex', '-1');
      option.dataset.id = String(pet.id);
      option.textContent = `${pet.name} the ${pet.commonName}`;

      fragment.appendChild(option);
    });

    this.elements.petList.appendChild(fragment);
  }

  private bindEvents(): void {
    this.bindPresetAmountEvents();
    this.bindOtherAmountEvents();
    this.bindPetEvents();
    this.bindRecurringEvents();
  }

  private bindPresetAmountEvents(): void {
    this.elements.presetAmountCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectPresetAmount(checkbox);
        }

        this.updateState();
      });
    });
  }

  private bindOtherAmountEvents(): void {
    this.elements.otherAmountCheckbox.addEventListener('change', () => {
      if (this.elements.otherAmountCheckbox.checked) {
        this.clearPresetAmounts();
        this.elements.otherAmountInput.focus();
      }

      this.updateState();
    });

    this.elements.otherAmountInput.setAttribute('inputmode', 'decimal');

    this.elements.otherAmountInput.addEventListener('keydown', (event) => {
      DonationAmountValidator.preventScientificNotation(event);
    });

    this.elements.otherAmountInput.addEventListener('input', () => {
      DonationAmountValidator.applyValidity(
        this.elements.otherAmountInput,
        this.elements.otherAmountCheckbox.checked
      );
      this.updateState();
    });

    this.elements.otherAmountInput.addEventListener('blur', () => {
      DonationAmountValidator.applyValidity(
        this.elements.otherAmountInput,
        this.elements.otherAmountCheckbox.checked
      );

      if (
        this.elements.otherAmountCheckbox.checked &&
        this.elements.otherAmountInput.value.trim() !== ''
      ) {
        this.elements.otherAmountInput.reportValidity();
      }
    });
  }

  private bindPetEvents(): void {
    this.elements.petList.addEventListener('click', (event) => {
      const target = event.target as Element;
      const option = target.closest('.cs__opt') as HTMLElement | null;

      if (!option) {
        return;
      }

      const id = Number(option.dataset.id);
      const label = option.textContent?.trim() ?? '';

      if (!Number.isFinite(id) || id <= 0 || !label) {
        return;
      }

      this.applyPetSelection({ id, label });
    });

    this.elements.petHiddenInput.addEventListener('change', () => {
      this.syncPetCheckbox();
      this.updateState();
    });

    const textObserver = new MutationObserver(() => {
      this.syncPetCheckbox();
      this.updateState();
    });

    textObserver.observe(this.elements.petText, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private bindRecurringEvents(): void {
    this.elements.recurringCheckbox.addEventListener('change', () => {
      this.persistState();
    });
  }

  private applyDefaultState(): void {
    const hasPresetAmount = this.elements.presetAmountCheckboxes.some((checkbox) => checkbox.checked);

    if (!hasPresetAmount && !this.elements.otherAmountCheckbox.checked) {
      this.elements.otherAmountCheckbox.checked = true;
    }

    this.syncOtherAmountInputState();
    this.syncPetCheckbox();
  }

  private selectPresetAmount(activeCheckbox: HTMLInputElement): void {
    this.elements.presetAmountCheckboxes.forEach((checkbox) => {
      checkbox.checked = checkbox === activeCheckbox;
    });

    this.elements.otherAmountCheckbox.checked = false;
    this.syncOtherAmountInputState();
  }

  private clearPresetAmounts(): void {
    this.elements.presetAmountCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    this.syncOtherAmountInputState();
  }

  private syncOtherAmountInputState(): void {
    const isOtherAmountSelected = this.elements.otherAmountCheckbox.checked;

    this.elements.otherAmountInput.disabled = !isOtherAmountSelected;
    DonationAmountValidator.applyValidity(this.elements.otherAmountInput, isOtherAmountSelected);
  }

  private applyPetSelection(pet: SelectedPet): void {
    this.elements.petHiddenInput.value = String(pet.id);
    this.elements.petText.textContent = pet.label;
    this.elements.petSelect.dataset.hasValue = 'true';

    this.syncPetCheckbox();
    this.updateState();
  }

  private syncPetCheckbox(): void {
    this.elements.petCheckbox.checked = this.getSelectedPet() !== null;
  }

  private getSelectedAmount(): SelectedAmount | null {
    const selectedPreset = this.elements.presetAmountCheckboxes.find((checkbox) => checkbox.checked);

    if (selectedPreset) {
      const label = selectedPreset
        .closest('.toggle')
        ?.querySelector('.toggle-ui')
        ?.textContent
        ?.trim();

      const numericValue = Number((label ?? '').replace(/[^\d.]/g, ''));

      if (label && numericValue > 0) {
        return {
          value: numericValue,
          label,
          type: 'preset',
        };
      }
    }

    if (!this.elements.otherAmountCheckbox.checked) {
      return null;
    }

    const otherAmountValue = this.elements.otherAmountInput.value.trim();

    if (!DonationAmountValidator.isValid(otherAmountValue)) {
      return null;
    }

    return {
      value: Number(otherAmountValue),
      label: `$${otherAmountValue}`,
      type: 'other',
    };
  }

  private getSelectedPet(): SelectedPet | null {
    const id = Number(this.elements.petHiddenInput.value);
    const label = this.elements.petText.textContent?.trim() ?? '';

    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    if (!label || label === this.petPlaceholder) {
      return null;
    }

    return { id, label };
  }

  private buildData(): DonationStep1Data | null {
    const amount = this.getSelectedAmount();
    const pet = this.getSelectedPet();

    if (!amount || !pet) {
      return null;
    }

    return {
      amount: amount.value,
      amountLabel: amount.label,
      amountType: amount.type,
      petId: pet.id,
      petLabel: pet.label,
      isMonthly: this.elements.recurringCheckbox.checked,
    };
  }

  private updateNextButtonState(): void {
    const isEnabled = this.buildData() !== null;

    this.elements.nextButton.setAttribute('aria-disabled', String(!isEnabled));
    this.elements.nextButton.tabIndex = isEnabled ? 0 : -1;
    this.elements.nextButton.classList.toggle('is-disabled', !isEnabled);
  }

  private persistState(): void {
    DonationStep1Store.set(this.buildData());
  }

  private updateState(): void {
    this.syncOtherAmountInputState();
    this.updateNextButtonState();
    this.persistState();
  }
}

/* END CONTROLLER */

class DonationAmountValidator {
  private static readonly plainPositiveNumberPattern = /^(?:\d+|\d*\.\d+)$/;

  static isValid(value: string): boolean {
    const normalized = value.trim();

    if (!this.plainPositiveNumberPattern.test(normalized)) {
      return false;
    }

    return Number(normalized) > 0;
  }

  static preventScientificNotation(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  static applyValidity(input: HTMLInputElement, isActive: boolean): void {
    const value = input.value.trim();

    if (!isActive || value === '' || this.isValid(value)) {
      input.setCustomValidity('');
      return;
    }

    input.setCustomValidity(
      'Enter a numeric value greater than 0. Scientific notation is not allowed.'
    );
  }
}
