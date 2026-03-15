// const panel = document.querySelector('.side-panel');

import { CameraController, getCameraControllerElements } from "./cameras/camera-controller";

// window.addEventListener('scroll', () => {
//   panel?.classList.toggle('is-scrolled', window.scrollY > 120);
// }, { passive: true });

document.addEventListener("DOMContentLoaded", async () => {
  const elements = getCameraControllerElements();

  if (!elements) {
    return;
  }

  const cameraController = new CameraController(elements);
  await cameraController.init();
});

document?.querySelector('.track')?.addEventListener('click', (e) => {
  const li = (e.target as Element)?.closest('li.item');
  if (!li) return;

  const url = li?.dataset.url;
  if (!url) return;

  window.open(url, '_blank', 'noopener,noreferrer');
});
