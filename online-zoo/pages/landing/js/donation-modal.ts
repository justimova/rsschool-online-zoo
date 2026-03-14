import { createAnimalService } from "../../../src/shared/app/services/animal.service";
import { createAuthStorage } from "../../../src/shared/app/services/auth-storage";
import { createDonationCardStorage } from "../../../src/shared/app/services/donation-card-storage";
import { createDonationService } from "../../../src/shared/app/services/donation.service";
import { DonationResultModalController } from "./donation/donation-result-modal-controller";
import { DonationStep1Controller } from "./donation/donation-step1-controller";
import { DonationStep2Controller } from "./donation/donation-step2-controller";
import { DonationStep3Controller } from "./donation/donation-step3-controller";
import { ModalManager } from "./donation/modal-manager";

const donationModalRoot = document.getElementById('donation-modal');

if (donationModalRoot instanceof HTMLElement) {
  const animalService = createAnimalService();
  const donationStep1Controller = new DonationStep1Controller(donationModalRoot, animalService);
  donationStep1Controller.init();
}

const modalManager = new ModalManager(document);
modalManager.init();

const donationStep2Root = document.getElementById('donation2-modal');

if (donationStep2Root instanceof HTMLElement) {
  const authStorage = createAuthStorage();

  const donationStep2Controller = new DonationStep2Controller(
    donationStep2Root,
    authStorage
  );

  donationStep2Controller.init();
}

const donationResultModalRoot = document.getElementById('donation-result-modal');
const donationStep3Root = document.getElementById('donation3-modal');

if (
  donationResultModalRoot instanceof HTMLElement &&
  donationStep3Root instanceof HTMLElement
) {
  const authStorage = createAuthStorage();
  const donationCardStorage = createDonationCardStorage();
  const donationService = createDonationService();
  const donationResultModalController = new DonationResultModalController(
    donationResultModalRoot
  );

  const donationStep3Controller = new DonationStep3Controller(
    donationStep3Root,
    authStorage,
    donationCardStorage,
    donationService,
    donationResultModalController
  );

  donationStep3Controller.init();
}