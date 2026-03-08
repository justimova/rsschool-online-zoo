import { ApiRoute } from "../../api/api-routes";
import { HttpClient, HttpMethod, } from "../../api/http-client";
import type { IHttpClient } from "../../api/http-client";
import type { IAuthResponse, TLoginPayload, TRegisterPayload } from "../../auth/auth.types";

export interface IAuthService {
  login(payload: TLoginPayload): Promise<IAuthResponse>;

  register(payload: TRegisterPayload): Promise<IAuthResponse>;
}

export class AuthService implements IAuthService {
  public constructor(private readonly httpClient: IHttpClient) {}

  public async register(payload: TRegisterPayload): Promise<IAuthResponse> {
    return this.httpClient.request<IAuthResponse, TRegisterPayload>({
      url: ApiRoute.Register,
      method: HttpMethod.Post,
      body: payload,
    });
  }

  public async login(payload: TLoginPayload): Promise<IAuthResponse> {
    return this.httpClient.request<IAuthResponse, TLoginPayload>({
      url: ApiRoute.Login,
      method: HttpMethod.Post,
      body: payload,
    });
  }
}

export function createAuthService(): IAuthService {
  const httpClient: IHttpClient = new HttpClient();
  return new AuthService(httpClient);
}

// https://vsqsnqnxkh.execute-api.eu-central-1.amazonaws.com/prod