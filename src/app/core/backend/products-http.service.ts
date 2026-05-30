import { Injectable } from '@angular/core';
import { HttpBase } from './http-base';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';
import { ProductFilter } from 'src/app/models/common/product-filter';
import { ProductDetails } from '@models/data';

@Injectable({ providedIn: 'root' })
export class ProductsHttpService extends HttpBase {
  getProducts$(
    filter: ProductFilter,
  ): Observable<ResponseObject<{ count: number; products: any[] }>> {
    return this.httpClient.post<ResponseObject<{ count: number; products: any[] }>>(
      `${this.apiUrl}/Product/filter`,
      filter,
    );
  }

  getProduct(id: string): Observable<ResponseObject<ProductDetails>> {
    return this.httpClient.get<ResponseObject<ProductDetails>>(`${this.apiUrl}/Product/${id}`);
  }

  getFitlers$(): Observable<ResponseObject<any>> {
    return this.httpClient.get<ResponseObject<any>>(`${this.apiUrl}/Product/filters`);
  }
}
