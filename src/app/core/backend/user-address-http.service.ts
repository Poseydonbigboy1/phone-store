import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBase } from './http-base';
import { ResponseObject } from '@models/common';
import { UserAddress } from '@models/data';

@Injectable({ providedIn: 'root' })
export class UserAddressHttpService extends HttpBase {
  getAll$(): Observable<ResponseObject<UserAddress[]>> {
    return this.httpClient.get<ResponseObject<UserAddress[]>>(`${this.apiUrl}/UserAddress`);
  }

  create$(model: Partial<UserAddress>): Observable<ResponseObject<UserAddress>> {
    return this.httpClient.post<ResponseObject<UserAddress>>(`${this.apiUrl}/UserAddress`, model);
  }

  update$(id: string, model: Partial<UserAddress>): Observable<ResponseObject<UserAddress>> {
    return this.httpClient.put<ResponseObject<UserAddress>>(`${this.apiUrl}/UserAddress/${id}`, model);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.apiUrl}/UserAddress/${id}`);
  }
}
