export interface IDonationCard {
  cardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  expirationDate: string;
}

export interface IStoredDonationCard extends IDonationCard {
  id: string;
  displayName: string;
}
