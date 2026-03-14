import {
  TestimonialsController,
  createTestimonialsElements,
} from "./testimonials/testimonials.controller";
import { TestimonialCardRenderer } from "./testimonials/testimonial-card.renderer";
import { createFeedbackService } from "../../../src/shared/app/services/feedback.service";

const testimonialsRoot = document.querySelector<HTMLElement>(".testimonials");

if (testimonialsRoot) {
  const elements = createTestimonialsElements(testimonialsRoot);
  const feedbackService = createFeedbackService();
  const testimonialCardRenderer = new TestimonialCardRenderer();

  const controller = new TestimonialsController(
    elements,
    feedbackService,
    testimonialCardRenderer,
  );

  controller.init().catch((error: unknown) => {
    console.error("Testimonials initialization failed", error);
  });
}
