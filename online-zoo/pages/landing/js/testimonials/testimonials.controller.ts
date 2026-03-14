
import type { IFeedbackService } from "../../../../src/shared/app/services/feedback.service";
import type { IFeedback, IFeedbacksResponse } from "../../../../src/shared/auth/feedback.types";
import type {
  ITestimonialCardRenderer,
  ITestimonialsController,
  TestimonialsElements,
  TestimonialsLayoutMode,
} from "./testimonials.types";

const CAROUSEL_ANIMATION_DURATION_MS = 450;

export class TestimonialsController implements ITestimonialsController {
  private feedbacks: IFeedback[] = [];

  private resizeFrameId: number | null = null;

  private currentLayoutMode: TestimonialsLayoutMode | null = null;

  private isAnimating = false;

  public constructor(
    private readonly elements: TestimonialsElements,
    private readonly feedbackService: IFeedbackService,
    private readonly testimonialCardRenderer: ITestimonialCardRenderer,
  ) {}

  public async init(): Promise<void> {
    this.bindEvents();
    await this.loadFeedbacks();
  }

  public destroy(): void {
    window.removeEventListener("resize", this.handleResize);
    this.elements.prevButton.removeEventListener("click", this.handlePrevClick);
    this.elements.nextButton.removeEventListener("click", this.handleNextClick);

    if (this.resizeFrameId !== null) {
      window.cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = null;
    }
  }

  private bindEvents(): void {
    window.addEventListener("resize", this.handleResize);
    this.elements.prevButton.addEventListener("click", this.handlePrevClick);
    this.elements.nextButton.addEventListener("click", this.handleNextClick);
  }

  private readonly handlePrevClick = (): void => {
    void this.slidePrev();
  };

  private readonly handleNextClick = (): void => {
    void this.slideNext();
  };

  private readonly handleResize = (): void => {
    if (!this.feedbacks.length) {
      return;
    }

    if (this.resizeFrameId !== null) {
      window.cancelAnimationFrame(this.resizeFrameId);
    }

    this.resizeFrameId = window.requestAnimationFrame(() => {
      const nextLayoutMode = this.getLayoutMode();

      if (nextLayoutMode !== this.currentLayoutMode) {
        this.renderFeedbacks();
        this.resetTrackPosition();
      }

      this.resizeFrameId = null;
    });
  };

  private async loadFeedbacks(): Promise<void> {
    this.showLoader();

    try {
      const response: IFeedbacksResponse = await this.feedbackService.getFeedbacks();
      this.feedbacks = response.data;
      this.renderFeedbacks();
      this.showTrack();
      this.resetTrackPosition();
    } catch (error: unknown) {
      console.error("Failed to load testimonials", error);
      this.showError();
    }
  }

  private renderFeedbacks(): void {
    this.currentLayoutMode = this.getLayoutMode();

    const itemsPerColumn = this.getItemsPerColumn();
    const columns = this.groupFeedbacksByColumns(this.feedbacks, itemsPerColumn);
    const fragment = document.createDocumentFragment();

    this.elements.track.replaceChildren();

    for (const feedbackGroup of columns) {
      const column = document.createElement("div");
      column.className = "testimonials-column";

      for (const feedback of feedbackGroup) {
        const card = this.testimonialCardRenderer.createCard(feedback);
        column.append(card);
      }

      fragment.append(column);
    }

    this.elements.track.append(fragment);
  }

  private groupFeedbacksByColumns(feedbacks: IFeedback[], itemsPerColumn: number): IFeedback[][] {
    const columns: IFeedback[][] = [];

    for (let index = 0; index < feedbacks.length; index += itemsPerColumn) {
      columns.push(feedbacks.slice(index, index + itemsPerColumn));
    }

    return columns;
  }

  private getLayoutMode(): TestimonialsLayoutMode {
    return window.innerWidth >= 1200 ? "two-rows" : "single-row";
  }

  private getItemsPerColumn(): number {
    return this.getLayoutMode() === "two-rows" ? 2 : 1;
  }

  private getColumns(): HTMLElement[] {
    return Array.from(this.elements.track.children) as HTMLElement[];
  }

  private getStepWidth(): number {
    const firstColumn = this.elements.track.firstElementChild as HTMLElement | null;

    if (!firstColumn) {
      return 0;
    }

    const trackStyles = window.getComputedStyle(this.elements.track);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "0");

    return firstColumn.offsetWidth + gap;
  }

  private resetTrackPosition(): void {
    const columns = this.getColumns();

    if (columns.length <= 1) {
      this.setTrackTransition(false);
      this.setTrackTranslateX(0);
      return;
    }

    const lastColumn = columns[columns.length - 1];
    this.elements.track.prepend(lastColumn);

    this.setTrackTransition(false);
    this.setTrackTranslateX(-this.getStepWidth());
  }

  private async slideNext(): Promise<void> {
    if (this.isAnimating || this.getColumns().length <= 1) {
      return;
    }

    this.isAnimating = true;
    this.setButtonsDisabled(true);

    this.setTrackTransition(true);
    this.setTrackTranslateX(-this.getStepWidth() * 2);

    await this.waitForAnimation();

    const firstColumn = this.elements.track.firstElementChild as HTMLElement | null;

    if (firstColumn) {
      this.elements.track.append(firstColumn);
    }

    this.setTrackTransition(false);
    this.setTrackTranslateX(-this.getStepWidth());

    this.isAnimating = false;
    this.setButtonsDisabled(false);
  }

  private async slidePrev(): Promise<void> {
    if (this.isAnimating || this.getColumns().length <= 1) {
      return;
    }

    this.isAnimating = true;
    this.setButtonsDisabled(true);

    this.setTrackTransition(true);
    this.setTrackTranslateX(0);

    await this.waitForAnimation();

    const columns = this.getColumns();
    const lastColumn = columns[columns.length - 1];

    if (lastColumn) {
      this.elements.track.prepend(lastColumn);
    }

    this.setTrackTransition(false);
    this.setTrackTranslateX(-this.getStepWidth());

    this.isAnimating = false;
    this.setButtonsDisabled(false);
  }

  private setTrackTranslateX(value: number): void {
    this.elements.track.style.transform = `translateX(${value}px)`;
  }

  private setTrackTransition(enabled: boolean): void {
    this.elements.track.style.transition = enabled
      ? `transform ${CAROUSEL_ANIMATION_DURATION_MS}ms ease`
      : "none";
  }

  private setButtonsDisabled(isDisabled: boolean): void {
    this.elements.prevButton.disabled = isDisabled;
    this.elements.nextButton.disabled = isDisabled;
  }

  private waitForAnimation(): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, CAROUSEL_ANIMATION_DURATION_MS);
    });
  }

  private showLoader(): void {
    this.elements.state.hidden = false;
    this.elements.loader.hidden = false;
    this.elements.error.hidden = true;
    this.elements.track.hidden = true;
  }

  private showError(): void {
    this.elements.state.hidden = false;
    this.elements.loader.hidden = true;
    this.elements.error.hidden = false;
    this.elements.track.hidden = true;
  }

  private showTrack(): void {
    this.elements.state.hidden = true;
    this.elements.loader.hidden = true;
    this.elements.error.hidden = true;
    this.elements.track.hidden = false;
  }
}

export function createTestimonialsElements(root: HTMLElement): TestimonialsElements {
  const prevButton = root.querySelector<HTMLButtonElement>(".testimonials-prev");
  const nextButton = root.querySelector<HTMLButtonElement>(".testimonials-next");
  const viewport = root.querySelector<HTMLDivElement>(".testimonials-viewport");
  const state = root.querySelector<HTMLDivElement>(".testimonials-state");
  const track = root.querySelector<HTMLDivElement>("[data-testimonials-track]");
  const loader = root.querySelector<HTMLDivElement>(".testimonials-loader");
  const error = root.querySelector<HTMLParagraphElement>(".testimonials-error");

  if (!prevButton) {
    throw new Error("Testimonials: .testimonials-prev not found");
  }

  if (!nextButton) {
    throw new Error("Testimonials: .testimonials-next not found");
  }

  if (!viewport) {
    throw new Error("Testimonials: .testimonials-viewport not found");
  }

  if (!state) {
    throw new Error("Testimonials: .testimonials-state not found");
  }

  if (!track) {
    throw new Error("Testimonials: [data-testimonials-track] not found");
  }

  if (!loader) {
    throw new Error("Testimonials: .testimonials-loader not found");
  }

  if (!error) {
    throw new Error("Testimonials: .testimonials-error not found");
  }

  return {
    root,
    prevButton,
    nextButton,
    viewport,
    state,
    track,
    loader,
    error,
  };
}
