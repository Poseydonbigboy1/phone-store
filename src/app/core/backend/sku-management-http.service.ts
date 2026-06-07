import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

export interface SkuComponentView {
  productComponentId: string;
  componentId: string;
  componentTitle: string;
  categoryTitle: string;
  value: string;
}

export interface SkuManagementViewModel {
  id: string;
  productId: string;
  productTitle: string;
  brandTitle: string;
  price: number;
  discount: number;
  finalPrice: number;
  amount: number;
  components: SkuComponentView[];
}

export interface SkuComponentUpsert {
  productComponentId?: string;
  componentId: string;
  value: string;
}

export interface SkuUpsertRequest {
  id?: string;
  productId: string;
  price: number;
  discount: number;
  amount: number;
  components: SkuComponentUpsert[];
}

@Injectable({ providedIn: 'root' })
export class SkuManagementHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/SkuManagement`;

  getAll$(): Observable<ResponseObject<SkuManagementViewModel[]>> {
    return this.httpClient.get<ResponseObject<SkuManagementViewModel[]>>(this.url);
  }

  getById$(id: string): Observable<ResponseObject<SkuManagementViewModel>> {
    return this.httpClient.get<ResponseObject<SkuManagementViewModel>>(`${this.url}/${id}`);
  }

  upsert$(req: SkuUpsertRequest): Observable<ResponseObject<SkuManagementViewModel>> {
    return this.httpClient.post<ResponseObject<SkuManagementViewModel>>(this.url, req);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
