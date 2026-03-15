export interface IAnimal {
  id: number;
  name: string;
  commonName: string;
  description: string;
}

export interface IAnimalsResponse {
  data: IAnimal[];
}

export interface ICamera {
  id: number;
  petId: number;
  text: string;
}

export interface ICamerasResponse {
  data: ICamera[];
}

export interface IDetailAnimal {
  id: number;
  commonName: string;
  scientificName: string;
  type: string;
  size: string;
  diet: string;
  habitat: string;
  range: string;
  latitude: string;
  longitude: string;
  description: string;
  detailedDescription: string;
}

export interface IAnimalResponse {
  data: IDetailAnimal;
}
