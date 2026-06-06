import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderDetail, OrderSummary } from '@models/data';
import { ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class CheckoutHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Order`;

  checkout$(request: CheckoutRequest): Observable<ResponseObject<{ orderId: string }>> {
    return this.httpClient.post<ResponseObject<{ orderId: string }>>(`${this.url}/checkout`, request);
  }

  getMyOrders$(): Observable<ResponseObject<OrderSummary[]>> {
    return this.httpClient.get<ResponseObject<OrderSummary[]>>(`${this.url}/my`);
  }

  getMyOrder$(id: string): Observable<ResponseObject<OrderDetail>> {
    return this.httpClient.get<ResponseObject<OrderDetail>>(`${this.url}/my/${id}`);
  }

  changeStatus$(orderId: string, status: number): Observable<ResponseObject<boolean>> {
    return this.httpClient.put<ResponseObject<boolean>>(`${this.url}/${orderId}/status`, { status });
  }
}
