import { Injectable } from '@angular/core';
import { HttpBase } from './http-base';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';

@Injectable({ providedIn: 'root' })
export class ProductsHttpService extends HttpBase {
  getFitlers$(): Observable<ResponseObject<any>> {
    return this.httpClient.get<ResponseObject<any>>(`${this.apiUrl}/Product/filters`);
  }
}
