import { Injectable } from '@angular/core';
import { HttpBase } from './http-base';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';
import { CatalogFilter } from 'src/app/models/common/catalog-filter';
import { ProductDetails } from '@models/data';

@Injectable({ providedIn: 'root' })
export class CatalogHttpService extends HttpBase {
  getProducts$(
    filter: CatalogFilter,
  ): Observable<ResponseObject<{ count: number; products: any[] }>> {
    return this.httpClient.post<ResponseObject<{ count: number; products: any[] }>>(
      `${this.apiUrl}/Catalog/filter`,
      filter,
    );
  }

  getProduct(id: string): Observable<ResponseObject<ProductDetails>> {
    return this.httpClient.get<ResponseObject<ProductDetails>>(`${this.apiUrl}/Catalog/${id}`);
  }

  getFilters$(): Observable<ResponseObject<any>> {
    return this.httpClient.get<ResponseObject<any>>(`${this.apiUrl}/Catalog/filters`);
  }

  getSimilar$(skuId: string, take = 6): Observable<ResponseObject<any[]>> {
    return this.httpClient.get<ResponseObject<any[]>>(`${this.apiUrl}/Catalog/similar/${skuId}?take=${take}`);
  }

  getPopular$(take = 10): Observable<ResponseObject<any[]>> {
    return this.httpClient.get<ResponseObject<any[]>>(`${this.apiUrl}/Catalog/popular?take=${take}`);
  }

  getDiscounted$(take = 10): Observable<ResponseObject<any[]>> {
    return this.httpClient.get<ResponseObject<any[]>>(`${this.apiUrl}/Catalog/discounted?take=${take}`);
  }

  getBatch$(skuIds: string[]): Observable<ResponseObject<any[]>> {
    return this.httpClient.post<ResponseObject<any[]>>(`${this.apiUrl}/Catalog/batch`, skuIds);
  }
}
