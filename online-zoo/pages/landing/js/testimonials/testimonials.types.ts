import type { IFeedback } from "../../../../src/shared/auth/feedback.types";

export type TestimonialsLayoutMode = "two-rows" | "single-row";

export interface TestimonialsElements {
  root: HTMLElement;
  prevButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  viewport: HTMLDivElement;
  state: HTMLDivElement;
  track: HTMLDivElement;
  loader: HTMLDivElement;
  error: HTMLParagraphElement;
}

export interface ITestimonialCardRenderer {
  createCard(feedback: IFeedback): HTMLDivElement;
}

export interface ITestimonialsController {
  init(): Promise<void>;
  destroy(): void;
}
