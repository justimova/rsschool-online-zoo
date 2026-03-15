import type { IAnimal } from "../../../../src/shared/auth/animal.types";
import type { IPetCardRenderer } from "./meet-pets.types";

interface PetCardRendererOptions {
  zooPagePath?: string;
  imageBasePath?: string;
  imageExtension?: string;
}

export class PetCardRenderer implements IPetCardRenderer {
  private readonly zooPagePath: string;

  private readonly imageBasePath: string;

  private readonly imageExtension: string;

  public constructor(options: PetCardRendererOptions = {}) {
    this.zooPagePath = options.zooPagePath ?? "../zoos/index.html";
    this.imageBasePath = options.imageBasePath ?? "../../assets/images/animals_card";
    this.imageExtension = options.imageExtension ?? ".png";
  }

  private getImagePath(name: string): string {
    const img = new URL(`${import.meta.env.BASE_URL}assets/images/animals_card${name}`, import.meta.url).href;
    return img; //`${import.meta.env.BASE_URL}assets/images/animals_card${name}`;
  }
  public createCard(animal: IAnimal): HTMLAnchorElement {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `${this.zooPagePath}?petId=${animal.id}`;
    card.dataset.petId = String(animal.id);
    card.setAttribute("aria-label", `${animal.commonName}. View live cam`);

    const media = document.createElement("div");
    media.className = "card--media";

    const image = document.createElement("img");
    image.className = "card--img";
    image.src = this.getImagePath(`${animal.id}${this.imageExtension}`); // `${this.imageBasePath}${animal.id}${this.imageExtension}`;
    image.alt = animal.commonName;
    image.loading = "lazy";

    const tag = document.createElement("div");
    tag.className = "card--tag subheader";
    tag.textContent = animal.name;

    media.append(image, tag);

    const panel = document.createElement("div");
    panel.className = "card--panel";

    const title = document.createElement("div");
    title.className = "card--title subheader";
    title.textContent = animal.commonName;

    const description = document.createElement("p");
    description.className = "card--text body--text";
    description.textContent = animal.description;

    const actionWrapper = document.createElement("div");

    const action = document.createElement("span");
    action.className = "btn btn--ghost btn--text link-arrow link-arrow-accent";
    action.textContent = "View live cam";

    actionWrapper.append(action);
    panel.append(title, description, actionWrapper);
    card.append(media, panel);

    return card;
  }
}
