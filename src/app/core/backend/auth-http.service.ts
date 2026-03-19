import { Injectable } from '@angular/core';
import { HttpBase } from './http-base';
import { Observable, of } from 'rxjs';
import { LoginRequest, ResponseObject } from '@models/common';
import { TokenResponse } from 'src/app/models/common/token-response';
import { ProfileResponse } from '@models/data';
import { HttpContext } from '@angular/common/http';
import { IS_CHECK_AUTH } from '@interceptors';

@Injectable({ providedIn: 'root' })
export class AuthHttpService extends HttpBase {
  /**
   * Логин
   * @param model
   * @returns
   */
  login$(model: LoginRequest): Observable<ResponseObject<TokenResponse>> {
    return this.httpClient.post<ResponseObject<TokenResponse>>(`${this.apiUrl}/Auth/Login`, model);
  }

  /**
   * Регитсранция
   */
  register$(): Observable<any> {
    throw new Error('Not implemented');
  }

  getProfile$(isCheckAuth: boolean): Observable<ResponseObject<ProfileResponse>> {
    return this.httpClient.get<ResponseObject<any>>(`${this.apiUrl}/Auth/checkAuth`,{
        context: new HttpContext().set(IS_CHECK_AUTH, isCheckAuth)
    });
  }

  logout$(): Observable<ResponseObject<boolean>> {
    return this.httpClient.get<ResponseObject<boolean>>(`${this.apiUrl}/Auth/logout`);
  }
}
