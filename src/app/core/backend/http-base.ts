import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export class HttpBase {
  protected apiUrl: string = 'http://localhost:5154/api';
  protected httpClient: HttpClient;

  constructor() {
    this.httpClient = inject(HttpClient);
  }
}
