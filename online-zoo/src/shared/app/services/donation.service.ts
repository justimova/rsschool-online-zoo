import { ApiRoute } from "../../api/api-routes";
import { HttpClient, HttpMethod, type IHttpClient } from "../../api/http-client";

export interface ICreateDonationPayload {
  name: string;
  email: string;
  amount: number;
  petId: number;  
}

export interface IDonationResponse {
  data: IDonationDataResponse;
}

export interface IDonationDataResponse {
  message: string;
  donationId: string;
}

export interface IDonationService {
  completeDonation(payload: ICreateDonationPayload): Promise<IDonationResponse>;
}

export class DonationService implements IDonationService {
  public constructor(private readonly httpClient: IHttpClient) {}

  public async completeDonation(
    payload: ICreateDonationPayload
  ): Promise<IDonationResponse> {
    return this.httpClient.request<IDonationResponse, ICreateDonationPayload>({
      url: ApiRoute.Donations,
      method: HttpMethod.Post,
      body: payload,
    });
  }
}

export function createDonationService(): IDonationService {
  const httpClient: IHttpClient = new HttpClient();
  return new DonationService(httpClient);
}