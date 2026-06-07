import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderItem } from '@models/data';
import { OrderItemFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class OrderItemsHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/OrderItem`;

  getAll$(filter: OrderItemFilter): Observable<ResponseObject<FilterResult<OrderItem>>> {
    return this.httpClient.post<ResponseObject<FilterResult<OrderItem>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<OrderItem>): Observable<ResponseObject<OrderItem>> {
    return this.httpClient.post<ResponseObject<OrderItem>>(this.url, item);
  }

  update$(item: OrderItem): Observable<ResponseObject<OrderItem>> {
    return this.httpClient.put<ResponseObject<OrderItem>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
