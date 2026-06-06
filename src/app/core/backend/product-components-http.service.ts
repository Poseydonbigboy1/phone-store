import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductComponent } from '@models/data';
import { ProductComponentFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class ProductComponentsHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/ProductComponent`;

  getAll$(filter: ProductComponentFilter): Observable<ResponseObject<FilterResult<ProductComponent>>> {
    return this.httpClient.post<ResponseObject<FilterResult<ProductComponent>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<ProductComponent>): Observable<ResponseObject<ProductComponent>> {
    return this.httpClient.post<ResponseObject<ProductComponent>>(this.url, item);
  }

  update$(item: ProductComponent): Observable<ResponseObject<ProductComponent>> {
    return this.httpClient.put<ResponseObject<ProductComponent>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
