export interface IAnimal {
  id: number;
  name: string;
  commonName: string;
  description: string;
}

export interface IAnimalsResponse {
  data: IAnimal[];
}
