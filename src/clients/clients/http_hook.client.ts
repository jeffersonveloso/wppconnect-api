import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class HttpHookClient {
  constructor(private readonly http: HttpService) {}

  private static getHeader(): Record<string, unknown> {
    return {
      headers: {
        'content-type': 'application/json',
      },
    };
  }

  public notify(url, body: Record<string, unknown>): Observable<AxiosResponse> {
    return this.http.post<AxiosResponse>(url, body, HttpHookClient.getHeader());
  }
}
