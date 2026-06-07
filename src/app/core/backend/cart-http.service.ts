import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '@models/data';
import { ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class CartHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Cart`;

  getCart$(): Observable<ResponseObject<CartItem[]>> {
    return this.httpClient.get<ResponseObject<CartItem[]>>(this.url);
  }

  addItem$(skuId: string, quantity: number): Observable<ResponseObject<boolean>> {
    return this.httpClient.post<ResponseObject<boolean>>(this.url, { skuId, quantity });
  }

  updateItem$(skuId: string, quantity: number): Observable<ResponseObject<boolean>> {
    return this.httpClient.put<ResponseObject<boolean>>(`${this.url}/${skuId}`, { quantity });
  }

  removeItem$(skuId: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${skuId}`);
  }

  mergeCart$(items: { skuId: string; quantity: number }[]): Observable<ResponseObject<boolean>> {
    return this.httpClient.post<ResponseObject<boolean>>(`${this.url}/merge`, items);
  }
}
