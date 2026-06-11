import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';

export class HttpBase {
  protected apiUrl: string = environment.apiUrl;
  protected httpClient: HttpClient;

  constructor() {
    this.httpClient = inject(HttpClient);
  }
}
