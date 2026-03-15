import { createAnimalService, type IAnimalService } from "../../../../src/shared/app/services/animal.service";
import type { ICamera, ICamerasResponse } from "../../../../src/shared/auth/animal.types";
import { getAnimalIconByText } from "./animal-icons";

const HEADER_HEIGHT = 110;
const VISIBLE_CAMERAS_COUNT = 4;

interface ICameraControllerElements {
  panel: HTMLElement;
  list: HTMLElement;
  toggleButton: HTMLButtonElement;
  scrollButton: HTMLButtonElement;
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
    await this.loadCameras();
  }

  private bindEvents(): void {
    this.elements.toggleButton.addEventListener("click", this.handleToggleClick);
    this.elements.scrollButton.addEventListener("click", this.handleScrollClick);

    window.addEventListener("scroll", this.updatePanelOffset, { passive: true });
    window.addEventListener("resize", this.updatePanelOffset, { passive: true });
  }

  private async loadCameras(): Promise<void> {
    try {
      const response: ICamerasResponse = await this.animalService.getCameras();
      this.cameras = response.data;
      this.activeCameraId = this.cameras[0]?.id ?? null;
      this.render();
    } catch (error: unknown) {
      // TODO
      // elements.formErrorElement.hidden = false;
      // elements.formErrorElement.textContent = error instanceof Error ? error.message : String(error);
      console.error(error);
    }
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

  private createCameraItem(camera: ICamera): HTMLLIElement {
    const listItem = document.createElement("li");
    listItem.className = "side-panel__list-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "side-panel__item";
    button.dataset.cameraId = String(camera.id);

    if (camera.id === this.activeCameraId) {
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
      this.handleCameraItemClick(camera.id);
    });

    listItem.append(button);

    return listItem;
  }

  private handleCameraItemClick(cameraId: number): void {
    this.activeCameraId = cameraId;
    this.render();

    // TODO
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

  if (
    !(panel instanceof HTMLElement) ||
    !(list instanceof HTMLElement) ||
    !(toggleButton instanceof HTMLButtonElement) ||
    !(scrollButton instanceof HTMLButtonElement)
  ) {
    return null;
  }

  return {
    panel,
    list,
    toggleButton,
    scrollButton,
  };
}
