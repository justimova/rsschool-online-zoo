import type { IAnimal } from "../../../../src/shared/auth/animal.types";

export type PetsLayoutMode = "two-rows" | "single-row";

export interface MeetPetsElements {
  root: HTMLElement;
  prevButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  viewport: HTMLDivElement;
  state: HTMLDivElement;
  track: HTMLDivElement;
  loader: HTMLDivElement;
  error: HTMLParagraphElement;
}

export interface IPetCardRenderer {
  createCard(animal: IAnimal): HTMLAnchorElement;
}

export interface IMeetPetsController {
  init(): Promise<void>;
  destroy(): void;
}
