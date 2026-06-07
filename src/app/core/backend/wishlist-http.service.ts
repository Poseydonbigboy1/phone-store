import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBase } from './http-base';
import { ResponseObject } from '@models/common';

@Injectable({ providedIn: 'root' })
export class WishlistHttpService extends HttpBase {
  getWishlist$(): Observable<ResponseObject<any[]>> {
    return this.httpClient.get<ResponseObject<any[]>>(`${this.apiUrl}/Wishlist`);
  }

  getIds$(): Observable<ResponseObject<string[]>> {
    return this.httpClient.get<ResponseObject<string[]>>(`${this.apiUrl}/Wishlist/ids`);
  }

  add$(skuId: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.post<ResponseObject<boolean>>(`${this.apiUrl}/Wishlist/${skuId}`, {});
  }

  remove$(skuId: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.apiUrl}/Wishlist/${skuId}`);
  }
}
