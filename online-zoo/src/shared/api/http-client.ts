import { API_BASE_URL } from "./api-config";

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
}

export interface IRequestOptions<TBody> {
  url: string;
  method: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
}

export interface IError {
    error: string;
}

export interface IHttpClient {
  request<TResponse, TBody = undefined>(
    options: IRequestOptions<TBody>
  ): Promise<TResponse>;
}

export class HttpClient implements IHttpClient {
  public async request<TResponse, TBody = undefined>(
    options: IRequestOptions<TBody>
  ): Promise<TResponse> {
    const requestUrl: string = `${API_BASE_URL}${options.url}`;

    const response: Response = await fetch(requestUrl, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (!response.ok) {
      const errorJson: string = await response.text();
      let errorText = '';
      
      if (errorJson) {
        const errorObj: IError = JSON.parse(errorJson);
        errorText = errorObj?.error ?? errorJson;
      }
      throw new Error(errorText || `HTTP error: ${response.status}`);
    }

    const data: unknown = await response.json();
    return data as TResponse;
  }
}
