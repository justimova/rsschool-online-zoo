import { createAnimalService } from "../../../src/shared/app/services/animal.service";
import { MeetPetsController, createMeetPetsElements } from "./meet-pets/meet-pets.controller";
import { PetCardRenderer } from "./meet-pets/pet-card.renderer";

const meetPetsRoot = document.querySelector<HTMLElement>(".meet-pets");

if (meetPetsRoot) {
  const elements = createMeetPetsElements(meetPetsRoot);
  const animalService = createAnimalService();
  const petCardRenderer = new PetCardRenderer();

  const controller = new MeetPetsController(
    elements,
    animalService,
    petCardRenderer,
  );

  controller.init().catch((error: unknown) => {
    console.error("MeetPets initialization failed", error);
  });
}
