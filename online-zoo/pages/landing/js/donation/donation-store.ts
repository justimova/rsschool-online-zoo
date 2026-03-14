import type { DonationStep1Data } from './types';

interface DonationWindow extends Window {
  donationStep1Data?: DonationStep1Data;
}

export class DonationStep1Store {
  private static readonly targetWindow = window as DonationWindow;

  static set(data: DonationStep1Data | null): void {
    if (data) {
      this.targetWindow.donationStep1Data = data;
      return;
    }

    delete this.targetWindow.donationStep1Data;
  }

  static get(): DonationStep1Data | null {
    return this.targetWindow.donationStep1Data ?? null;
  }
}

import type { DonationStep2Data } from './types';

interface DonationWindow extends Window {
  donationStep2Data?: DonationStep2Data;
}

export class DonationStep2Store {
  private static readonly targetWindow = window as DonationWindow;

  public static set(data: DonationStep2Data | null): void {
    if (data) {
      this.targetWindow.donationStep2Data = data;
      return;
    }

    delete this.targetWindow.donationStep2Data;
  }

  public static get(): DonationStep2Data | null {
    return this.targetWindow.donationStep2Data ?? null;
  }
}
