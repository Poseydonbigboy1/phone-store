import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '@models/data';
import { OrderFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class OrdersHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Order`;

  getAll$(filter: OrderFilter): Observable<ResponseObject<FilterResult<Order>>> {
    return this.httpClient.post<ResponseObject<FilterResult<Order>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<Order>): Observable<ResponseObject<Order>> {
    return this.httpClient.post<ResponseObject<Order>>(this.url, item);
  }

  update$(item: Order): Observable<ResponseObject<Order>> {
    return this.httpClient.put<ResponseObject<Order>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
