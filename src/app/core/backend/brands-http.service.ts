import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand } from '@models/data';
import { BrandFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class BrandsHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Brand`;

  getBrands$(filter: BrandFilter): Observable<ResponseObject<FilterResult<Brand>>> {
    return this.httpClient.post<ResponseObject<FilterResult<Brand>>>(`${this.url}/filter`, filter);
  }

  createBrand$(title: string): Observable<ResponseObject<Brand>> {
    return this.httpClient.post<ResponseObject<Brand>>(this.url, { title });
  }

  updateBrand$(id: string, title: string): Observable<ResponseObject<Brand>> {
    return this.httpClient.put<ResponseObject<Brand>>(this.url, { id, title });
  }

  deleteBrand$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
