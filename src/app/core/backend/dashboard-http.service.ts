import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpBase } from './http-base';
import { ResponseObject } from '@models/common';
import { DashboardViewModel } from '@models/data';

@Injectable({ providedIn: 'root' })
export class DashboardHttpService extends HttpBase {
  get$(): Observable<ResponseObject<DashboardViewModel>> {
    return this.httpClient.get<ResponseObject<DashboardViewModel>>(`${this.apiUrl}/Dashboard`);
  }
}
