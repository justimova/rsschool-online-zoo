import { ApiRoute } from "../../api/api-routes";
import type { IHttpClient } from "../../api/http-client";
import { HttpClient, HttpMethod } from "../../api/http-client";
import type { IFeedbacksResponse } from "../../auth/feedback.types";


export interface IFeedbackService {
  getFeedbacks(): Promise<IFeedbacksResponse>;
}

export class FeedbackService implements IFeedbackService {
  public constructor(private readonly httpClient: IHttpClient) {}

  public async getFeedbacks(): Promise<IFeedbacksResponse> {
    return this.httpClient.request<IFeedbacksResponse>({
      url: ApiRoute.Feedback,
      method: HttpMethod.Get,
    });
  }
}

export function createFeedbackService(): IFeedbackService {
  const httpClient: IHttpClient = new HttpClient();
  return new FeedbackService(httpClient);
}
