export type AmountType = 'preset' | 'other';

export interface DonationStep1Data {
  amount: number;
  amountLabel: string;
  amountType: AmountType;
  petId: number;
  petLabel: string;
  isMonthly: boolean;
}

export interface SelectedAmount {
  value: number;
  label: string;
  type: AmountType;
}

export interface SelectedPet {
  id: number;
  label: string;
}

export interface DonationStep2Data {
  name: string;
  email: string;
}

export interface DonationStep3Data {
  cardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  expirationDate: string;
}

export const DONATION_STEP_1_EVENT = 'donation:step1-complete';

export type ModalOpenedDetail = {
  modalId: string;
  modal: HTMLElement;
};

export const MODAL_OPENED_EVENT = 'modal:opened';

