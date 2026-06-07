import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sku } from '@models/data';
import { SkuFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class SkusHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Sku`;

  getAll$(filter: SkuFilter): Observable<ResponseObject<FilterResult<Sku>>> {
    return this.httpClient.post<ResponseObject<FilterResult<Sku>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<Sku>): Observable<ResponseObject<Sku>> {
    return this.httpClient.post<ResponseObject<Sku>>(this.url, item);
  }

  update$(item: Sku): Observable<ResponseObject<Sku>> {
    return this.httpClient.put<ResponseObject<Sku>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
