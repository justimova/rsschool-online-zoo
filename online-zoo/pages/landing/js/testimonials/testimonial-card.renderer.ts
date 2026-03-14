import type { IFeedback } from "../../../../src/shared/auth/feedback.types";
import type { ITestimonialCardRenderer } from "./testimonials.types";

export class TestimonialCardRenderer implements ITestimonialCardRenderer {
  public createCard(feedback: IFeedback): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "review-card";

    const icon = document.createElement("div");
    icon.className = "review-icon";
    icon.textContent = "“";

    const location = document.createElement("div");
    location.className = "subheader";
    location.textContent = `${feedback.city}, ${feedback.month} ${feedback.year}`;

    const text = document.createElement("div");
    text.className = "body--text";
    text.textContent = feedback.text;

    const author = document.createElement("div");
    author.className = "btn--text";
    author.textContent = feedback.name;

    card.append(icon, location, text, author);

    return card;
  }
}
