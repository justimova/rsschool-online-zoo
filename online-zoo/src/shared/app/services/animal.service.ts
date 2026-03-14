import { ApiRoute } from "../../api/api-routes";
import type { IHttpClient } from "../../api/http-client";
import { HttpClient, HttpMethod } from "../../api/http-client";
import type { IAnimalsResponse } from "../../auth/animal.types";


export interface IAnimalService {
  getAnimals(): Promise<IAnimalsResponse>;
}

export class AnimalService implements IAnimalService {
  public constructor(private readonly httpClient: IHttpClient) {}

  public async getAnimals(): Promise<IAnimalsResponse> {
    return this.httpClient.request<IAnimalsResponse>({
      url: ApiRoute.Pets,
      method: HttpMethod.Get,
    });
  }
}

export function createAnimalService(): IAnimalService {
  const httpClient: IHttpClient = new HttpClient();
  return new AnimalService(httpClient);
}
