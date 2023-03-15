import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { SuccessResponse } from '../../domain/entities/response/response';

@Injectable()
export class HttpHookClient {
  private readonly logger = new Logger(HttpHookClient.name);

  constructor(private readonly http: HttpService) {}

  private static getHeader(): Record<string, unknown> {
    return {
      headers: {
        'content-type': 'application/json',
      },
    };
  }

  public makePostRequest<T>(
    url,
    body: Record<string, unknown>,
    headers = HttpHookClient.getHeader(),
  ): Promise<SuccessResponse<T>> {
    return new Promise((resolve, reject) => {
      this.http.post<AxiosResponse>(url, body).subscribe({
        next: (response) => {
          if (response.status >= 200 && response.status <= 299) {
            return resolve(
              new SuccessResponse<T>({
                data: response.data as unknown as T,
                success: true,
              }),
            );
          } else {
            return reject(response.data);
          }
        },
        error: (error) => {
          reject({ error });
        },
      });
    });
  }

  public makeGetRequest<T>(
    url,
    headers = HttpHookClient.getHeader(),
  ): Promise<SuccessResponse<T>> {
    return new Promise((resolve, reject) => {
      this.http.get<AxiosResponse>(url).subscribe({
        next: (response) => {
          if (response.status >= 200 && response.status <= 299) {
            return resolve(
              new SuccessResponse<T>({
                data: response.data as unknown as T,
                success: true,
              }),
            );
          } else {
            return reject(response.data);
          }
        },
        error: (error) => {
          reject({ error });
        },
      });
    });
  }
}
