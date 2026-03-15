import { ApiRoute } from "../../api/api-routes";
import type { IHttpClient } from "../../api/http-client";
import { HttpClient, HttpMethod } from "../../api/http-client";
import type { IAnimalResponse, IAnimalsResponse, ICamerasResponse } from "../../auth/animal.types";


export interface IAnimalService {
  getAnimals(): Promise<IAnimalsResponse>;
  getCameras(): Promise<ICamerasResponse>;
  getAnimal(petId: number): Promise<IAnimalResponse>;
}

export class AnimalService implements IAnimalService {
  public constructor(private readonly httpClient: IHttpClient) {}

  public async getAnimals(): Promise<IAnimalsResponse> {
    return this.httpClient.request<IAnimalsResponse>({
      url: ApiRoute.Pets,
      method: HttpMethod.Get,
    });
  }

  public async getAnimal(petId: number): Promise<IAnimalResponse> {
    return this.httpClient.request<IAnimalResponse>({
      url: `${ApiRoute.Pets}/${petId}`,
      method: HttpMethod.Get,
    });
  }

  public async getCameras(): Promise<ICamerasResponse> {
    return this.httpClient.request<ICamerasResponse>({
      url: ApiRoute.Cameras,
      method: HttpMethod.Get,
    });
  }
}

export function createAnimalService(): IAnimalService {
  const httpClient: IHttpClient = new HttpClient();
  return new AnimalService(httpClient);
}
