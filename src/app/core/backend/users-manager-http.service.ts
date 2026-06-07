import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ManagerUser } from '@models/data';
import { UserFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class UsersManagerHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/User`;

  getAll$(filter: UserFilter): Observable<ResponseObject<FilterResult<ManagerUser>>> {
    return this.httpClient.post<ResponseObject<FilterResult<ManagerUser>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<ManagerUser>): Observable<ResponseObject<ManagerUser>> {
    return this.httpClient.post<ResponseObject<ManagerUser>>(this.url, item);
  }

  update$(item: ManagerUser): Observable<ResponseObject<ManagerUser>> {
    return this.httpClient.put<ResponseObject<ManagerUser>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
