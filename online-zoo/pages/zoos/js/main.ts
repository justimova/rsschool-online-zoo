import { CameraController, getCameraControllerElements } from "./cameras/camera-controller";

document.addEventListener("DOMContentLoaded", async () => {
  const elements = getCameraControllerElements();

  if (!elements) {
    return;
  }

  const cameraController = new CameraController(elements);
  await cameraController.init();
});
