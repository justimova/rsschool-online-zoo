import { createAnimalService, type IAnimalService } from "../../../../src/shared/app/services/animal.service";
import type { ICamera, ICamerasResponse } from "../../../../src/shared/auth/animal.types";
import { getAnimalIconByText } from "./animal-icons";

const HEADER_HEIGHT = 110;
const VISIBLE_CAMERAS_COUNT = 4;
// const IMAGE_BASE_PATH = "../../assets/images";
const CAMERA_LINK = "https://www.youtube.com/watch?v=OevbuYwXDw4";
const THUMBNAILS_COUNT = 3;
const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please, refresh the page";

interface IDetailAnimal {
  id: number;
  commonName: string;
  scientificName: string;
  type: string;
  size: string;
  diet: string;
  habitat: string;
  range: string;
  description: string;
  detailedDescription: string;
}

interface ICameraControllerElements {
  panel: HTMLElement;
  list: HTMLElement;
  toggleButton: HTMLButtonElement;
  scrollButton: HTMLButtonElement;
  pageStateSection: HTMLElement;
  pageLoader: HTMLElement;
  pageError: HTMLElement;
  camsSection: HTMLElement;
  donationSection: HTMLElement;
  youKnowSection: HTMLElement;
  currentImage: HTMLImageElement;
  currentLabel: HTMLElement;
  currentLink: HTMLAnchorElement;
  thumbnailsTrack: HTMLElement;
  youKnowState: HTMLElement;
  youKnowLoader: HTMLElement;
  youKnowError: HTMLElement;
  youKnowContent: HTMLElement;
  animalDescription: HTMLElement;
  animalCommonName: HTMLElement;
  animalScientificName: HTMLElement;
  animalType: HTMLElement;
  animalSize: HTMLElement;
  animalDiet: HTMLElement;
  animalHabitat: HTMLElement;
  animalRange: HTMLElement;
  animalDetails: HTMLElement;
  animalImage: HTMLImageElement;
}

export class CameraController {
  private readonly animalService: IAnimalService;
  private readonly elements: ICameraControllerElements;

  private cameras: ICamera[] = [];
  private activeCameraId: number | null = null;
  private visibleStartIndex = 0;
  private isExpanded = false;

  public constructor(elements: ICameraControllerElements) {
    this.elements = elements;
    this.animalService = createAnimalService();
  }

  public async init(): Promise<void> {
    this.bindEvents();
    this.updatePanelOffset();
    this.syncPanelState();
    await this.loadInitialData();
  }

  private bindEvents(): void {
    this.elements.toggleButton.addEventListener("click", this.handleToggleClick);
    this.elements.scrollButton.addEventListener("click", this.handleScrollClick);

    window.addEventListener("scroll", this.updatePanelOffset, { passive: true });
    window.addEventListener("resize", this.updatePanelOffset, { passive: true });
  }

  private async loadInitialData(): Promise<void> {
    this.showPageLoader();

    try {
      const response: ICamerasResponse = await this.animalService.getCameras();
      this.cameras = response.data;

      if (!this.cameras.length) {
        throw new Error("Cameras list is empty");
      }

      const firstPetId = this.getCameraPetId(this.cameras[0]);

      this.activeCameraId = firstPetId;
      this.render();
      this.renderCurrentCamera(firstPetId);
      this.renderThumbnails(firstPetId);
      this.showPageContent();

      await this.loadAnimalDetails(firstPetId);
    } catch (error: unknown) {
      this.showPageError();
      console.error(error);
    }
  }

  private async loadAnimalDetails(petId: number): Promise<void> {
    this.showYouKnowLoader();

    try {
      const response = await this.animalService.getAnimal(petId) as { data?: IDetailAnimal } | IDetailAnimal;
      const animal = this.extractAnimal(response);

      this.renderAnimalDetails(animal);
      this.showYouKnowContent();
    } catch (error: unknown) {
      this.showYouKnowError();
      console.error(error);
    }
  }

  private extractAnimal(response: { data?: IDetailAnimal } | IDetailAnimal): IDetailAnimal {
    if ("data" in response && response.data) {
      return response.data;
    }

    return response as IDetailAnimal;
  }

  private render(): void {
    const fragment = document.createDocumentFragment();
    const visibleCameras = this.getVisibleCameras();

    this.elements.list.replaceChildren();

    visibleCameras.forEach((camera) => {
      fragment.append(this.createCameraItem(camera));
    });

    this.elements.list.append(fragment);
    this.elements.scrollButton.disabled = this.cameras.length <= VISIBLE_CAMERAS_COUNT;
  }

  private renderCurrentCamera(petId: number): void {
    this.elements.currentLink.href = CAMERA_LINK;
    this.elements.currentImage.src = this.getImage(`cams_${petId}.png`); // `${IMAGE_BASE_PATH}/cams_${petId}.png`;
    this.elements.currentImage.alt = "Watch video";
    this.elements.currentLabel.textContent = "";
  }

  private renderThumbnails(petId: number): void {
    const fragment = document.createDocumentFragment();

    this.elements.thumbnailsTrack.replaceChildren();

    Array.from({ length: THUMBNAILS_COUNT }, (_, index) => index + 1).forEach((cameraNumber) => {
      fragment.append(this.createThumbnailItem(petId, cameraNumber));
    });

    this.elements.thumbnailsTrack.append(fragment);
  }

  private renderAnimalDetails(animal: IDetailAnimal): void {
    this.elements.currentLabel.textContent = `${animal.commonName} cam 1`;
    this.elements.currentImage.alt = `${animal.commonName} cam 1`;
    this.elements.animalDescription.textContent = animal.description;
    this.elements.animalCommonName.textContent = animal.commonName;
    this.elements.animalScientificName.textContent = animal.scientificName;
    this.elements.animalType.textContent = animal.type;
    this.elements.animalSize.textContent = animal.size;
    this.elements.animalDiet.textContent = animal.diet;
    this.elements.animalHabitat.textContent = animal.habitat;
    this.elements.animalRange.textContent = animal.range;
    this.elements.animalDetails.textContent = animal.detailedDescription;
    this.elements.animalImage.src = this.getImage(`you_know${animal.id}.png`); // `${IMAGE_BASE_PATH}/you_know${animal.id}.png`;
    this.elements.animalImage.alt = animal.commonName;
  }

  private createThumbnailItem(petId: number, cameraNumber: number): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.className = "item";

    if (cameraNumber === 1) {
      listItem.classList.add("active");
    }

    const link = document.createElement("a");
    link.className = "item__link";
    link.href = CAMERA_LINK;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.url = CAMERA_LINK;
    link.setAttribute("aria-label", `Open CAM ${cameraNumber}`);

    const label = document.createElement("span");
    label.className = "item__label";
    label.textContent = `CAM ${cameraNumber}`;

    const play = document.createElement("span");
    play.className = "item__play";
    play.setAttribute("aria-hidden", "true");

    const image = document.createElement("img");
    image.src = this.getImage(`cams_${petId}_${cameraNumber}.png`); // `${IMAGE_BASE_PATH}/cams_${petId}_${cameraNumber}.png`;
    image.alt = `CAM ${cameraNumber}`;

    link.append(label, play, image);
    listItem.append(link);

    return listItem;
  }

  private getImage(fileName: string): string {
    return new URL(`${import.meta.env.BASE_URL}assets/images/${fileName}`, import.meta.url).href;
  }
  private createCameraItem(camera: ICamera): HTMLLIElement {
    const cameraId = this.getCameraPetId(camera);
    const listItem = document.createElement("li");
    listItem.className = "side-panel__list-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "side-panel__item";
    button.dataset.cameraId = String(cameraId);

    if (cameraId === this.activeCameraId) {
      button.classList.add("is-active");
    }

    const visual = document.createElement("span");
    visual.className = "side-panel__item-visual";
    visual.setAttribute("aria-hidden", "true");

    const icon = document.createElement("span");
    icon.className = "side-panel__item-icon";

    const iconPath = getAnimalIconByText(camera.text);

    if (iconPath) {
      button.style.setProperty("--animal-icon", `url("${iconPath}")`);
    }

    const text = document.createElement("span");
    text.className = "side-panel__item-text";
    text.textContent = camera.text;

    visual.append(icon);
    button.append(visual, text);

    button.addEventListener("click", () => {
      void this.handleCameraItemClick(cameraId);
    });

    listItem.append(button);

    return listItem;
  }

  private async handleCameraItemClick(cameraId: number): Promise<void> {
    this.activeCameraId = cameraId;
    this.render();
    this.renderCurrentCamera(cameraId);
    this.renderThumbnails(cameraId);
    await this.loadAnimalDetails(cameraId);
  }

  private handleToggleClick = (): void => {
    this.isExpanded = !this.isExpanded;
    this.syncPanelState();
  };

  private handleScrollClick = (): void => {
    if (this.cameras.length <= 1) {
      return;
    }

    this.visibleStartIndex = (this.visibleStartIndex + 1) % this.cameras.length;
    this.render();
  };

  private syncPanelState(): void {
    this.elements.panel.classList.toggle("is-expanded", this.isExpanded);
    this.elements.panel.classList.toggle("is-collapsed", !this.isExpanded);

    this.elements.toggleButton.setAttribute("aria-expanded", String(this.isExpanded));
    this.elements.toggleButton.setAttribute(
      "aria-label",
      this.isExpanded ? "Collapse camera panel" : "Expand camera panel"
    );
  }

  private getVisibleCameras(): ICamera[] {
    if (this.cameras.length <= VISIBLE_CAMERAS_COUNT) {
      return [...this.cameras];
    }

    return Array.from({ length: VISIBLE_CAMERAS_COUNT }, (_, index) => {
      const cameraIndex = (this.visibleStartIndex + index) % this.cameras.length;
      return this.cameras[cameraIndex];
    });
  }

  private getCameraPetId(camera: ICamera): number {
    const extendedCamera = camera as ICamera & { petId?: number };
    return typeof extendedCamera.petId === "number" ? extendedCamera.petId : camera.id;
  }

  private showPageLoader(): void {
    this.elements.pageStateSection.hidden = false;
    this.elements.pageLoader.hidden = false;
    this.elements.pageError.hidden = true;

    this.elements.panel.hidden = true;
    this.elements.camsSection.hidden = true;
    this.elements.donationSection.hidden = true;
    this.elements.youKnowSection.hidden = true;
  }

  private showPageError(): void {
    this.elements.pageLoader.hidden = true;
    this.elements.pageError.hidden = false;
    this.elements.pageError.textContent = DEFAULT_ERROR_MESSAGE;
  }

  private showPageContent(): void {
    this.elements.pageStateSection.hidden = true;
    this.elements.panel.hidden = false;
    this.elements.camsSection.hidden = false;
    this.elements.donationSection.hidden = false;
    this.elements.youKnowSection.hidden = false;
  }

  private showYouKnowLoader(): void {
    this.elements.youKnowState.hidden = false;
    this.elements.youKnowLoader.hidden = false;
    this.elements.youKnowError.hidden = true;
    this.elements.youKnowContent.hidden = true;
  }

  private showYouKnowError(): void {
    this.elements.youKnowState.hidden = false;
    this.elements.youKnowLoader.hidden = true;
    this.elements.youKnowError.hidden = false;
    this.elements.youKnowError.textContent = DEFAULT_ERROR_MESSAGE;
    this.elements.youKnowContent.hidden = true;
  }

  private showYouKnowContent(): void {
    this.elements.youKnowState.hidden = true;
    this.elements.youKnowLoader.hidden = true;
    this.elements.youKnowError.hidden = true;
    this.elements.youKnowContent.hidden = false;
  }

  private updatePanelOffset = (): void => {
    const offset = Math.max(HEADER_HEIGHT - window.scrollY, 0);
    this.elements.panel.style.setProperty("--side-panel-top", `${offset}px`);
  };
}

export function getCameraControllerElements(): ICameraControllerElements | null {
  const panel = document.getElementById("camera-side-panel");
  const list = document.getElementById("camera-side-panel-list");
  const toggleButton = document.getElementById("camera-side-panel-toggle");
  const scrollButton = document.getElementById("camera-side-panel-scroll");
  const pageStateSection = document.getElementById("cams-page-state");
  const pageLoader = document.getElementById("cams-page-loader");
  const pageError = document.getElementById("cams-page-error");
  const camsSection = document.getElementById("cams-section");
  const donationSection = document.getElementById("donation-section");
  const youKnowSection = document.getElementById("you-know-section");
  const currentImage = document.getElementById("cams-current-image");
  const currentLabel = document.getElementById("cams-current-label");
  const currentLink = document.getElementById("cams-current-link");
  const thumbnailsTrack = document.getElementById("cams-track");
  const youKnowState = document.getElementById("you-know-state");
  const youKnowLoader = document.getElementById("you-know-loader");
  const youKnowError = document.getElementById("you-know-error");
  const youKnowContent = document.getElementById("you-know-content");
  const animalDescription = document.getElementById("animal-description");
  const animalCommonName = document.getElementById("animal-common-name");
  const animalScientificName = document.getElementById("animal-scientific-name");
  const animalType = document.getElementById("animal-type");
  const animalSize = document.getElementById("animal-size");
  const animalDiet = document.getElementById("animal-diet");
  const animalHabitat = document.getElementById("animal-habitat");
  const animalRange = document.getElementById("animal-range");
  const animalDetails = document.getElementById("animal-details");
  const animalImage = document.getElementById("animal-image");

  if (
    !(panel instanceof HTMLElement) ||
    !(list instanceof HTMLElement) ||
    !(toggleButton instanceof HTMLButtonElement) ||
    !(scrollButton instanceof HTMLButtonElement) ||
    !(pageStateSection instanceof HTMLElement) ||
    !(pageLoader instanceof HTMLElement) ||
    !(pageError instanceof HTMLElement) ||
    !(camsSection instanceof HTMLElement) ||
    !(donationSection instanceof HTMLElement) ||
    !(youKnowSection instanceof HTMLElement) ||
    !(currentImage instanceof HTMLImageElement) ||
    !(currentLabel instanceof HTMLElement) ||
    !(currentLink instanceof HTMLAnchorElement) ||
    !(thumbnailsTrack instanceof HTMLElement) ||
    !(youKnowState instanceof HTMLElement) ||
    !(youKnowLoader instanceof HTMLElement) ||
    !(youKnowError instanceof HTMLElement) ||
    !(youKnowContent instanceof HTMLElement) ||
    !(animalDescription instanceof HTMLElement) ||
    !(animalCommonName instanceof HTMLElement) ||
    !(animalScientificName instanceof HTMLElement) ||
    !(animalType instanceof HTMLElement) ||
    !(animalSize instanceof HTMLElement) ||
    !(animalDiet instanceof HTMLElement) ||
    !(animalHabitat instanceof HTMLElement) ||
    !(animalRange instanceof HTMLElement) ||
    !(animalDetails instanceof HTMLElement) ||
    !(animalImage instanceof HTMLImageElement)
  ) {
    return null;
  }

  return {
    panel,
    list,
    toggleButton,
    scrollButton,
    pageStateSection,
    pageLoader,
    pageError,
    camsSection,
    donationSection,
    youKnowSection,
    currentImage,
    currentLabel,
    currentLink,
    thumbnailsTrack,
    youKnowState,
    youKnowLoader,
    youKnowError,
    youKnowContent,
    animalDescription,
    animalCommonName,
    animalScientificName,
    animalType,
    animalSize,
    animalDiet,
    animalHabitat,
    animalRange,
    animalDetails,
    animalImage,
  };
}
