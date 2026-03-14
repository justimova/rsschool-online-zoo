import type { IDonationCard, IStoredDonationCard } from "../../auth/card.types";

const DONATION_CARDS_STORAGE_PREFIX = 'donation_cards';

export interface IDonationCardStorage {
  getCards(userLogin: string): IStoredDonationCard[];
  saveCard(userLogin: string, card: IDonationCard): IStoredDonationCard[];
}

export class DonationCardStorage implements IDonationCardStorage {
  public getCards(userLogin: string): IStoredDonationCard[] {
    const rawValue = localStorage.getItem(this.buildStorageKey(userLogin));

    if (rawValue === null) {
      return [];
    }

    try {
      const parsedValue: unknown = JSON.parse(rawValue);

      if (!Array.isArray(parsedValue)) {
        return [];
      }

      return parsedValue.filter((item): item is IStoredDonationCard => this.isStoredCard(item));
    } catch {
      return [];
    }
  }

  public saveCard(userLogin: string, card: IDonationCard): IStoredDonationCard[] {
    const cards = this.getCards(userLogin);
    const existingCardIndex = cards.findIndex((item) => item.cardNumber === card.cardNumber);

    const storedCard: IStoredDonationCard = {
      id: this.buildCardId(card.cardNumber),
      displayName: this.buildDisplayName(card.cardNumber),
      ...card,
    };

    if (existingCardIndex >= 0) {
      cards[existingCardIndex] = storedCard;
    } else {
      cards.push(storedCard);
    }

    localStorage.setItem(this.buildStorageKey(userLogin), JSON.stringify(cards));

    return cards;
  }

  private buildStorageKey(userLogin: string): string {
    return `${DONATION_CARDS_STORAGE_PREFIX}:${userLogin}`;
  }

  private buildCardId(cardNumber: string): string {
    return `card_${cardNumber}`;
  }

  private buildDisplayName(cardNumber: string): string {
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
  }

  private isStoredCard(value: unknown): value is IStoredDonationCard {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate.id === 'string' &&
      typeof candidate.displayName === 'string' &&
      typeof candidate.cardNumber === 'string' &&
      typeof candidate.cvv === 'string' &&
      typeof candidate.expirationMonth === 'string' &&
      typeof candidate.expirationYear === 'string' &&
      typeof candidate.expirationDate === 'string'
    );
  }
}

export function createDonationCardStorage(): IDonationCardStorage {
  return new DonationCardStorage();
}
