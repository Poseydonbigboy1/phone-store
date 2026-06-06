import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '@models/data';
import { ProductFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class ProductsManagerHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Product`;

  getAll$(filter: ProductFilter): Observable<ResponseObject<FilterResult<Product>>> {
    return this.httpClient.post<ResponseObject<FilterResult<Product>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<Product>): Observable<ResponseObject<Product>> {
    return this.httpClient.post<ResponseObject<Product>>(this.url, item);
  }

  update$(item: Product): Observable<ResponseObject<Product>> {
    return this.httpClient.put<ResponseObject<Product>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
