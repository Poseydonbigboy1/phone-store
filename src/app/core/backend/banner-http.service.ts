import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BannerUpsert {
  imageUrl?: string;
  link?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable({ providedIn: 'root' })
export class BannerHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Banner`;

  getActive$(): Observable<ResponseObject<Banner[]>> {
    return this.httpClient.get<ResponseObject<Banner[]>>(this.url);
  }

  getAll$(): Observable<ResponseObject<Banner[]>> {
    return this.httpClient.get<ResponseObject<Banner[]>>(`${this.url}/all`);
  }

  create$(model: BannerUpsert): Observable<ResponseObject<Banner>> {
    return this.httpClient.post<ResponseObject<Banner>>(this.url, model);
  }

  update$(id: string, model: BannerUpsert): Observable<ResponseObject<boolean>> {
    return this.httpClient.put<ResponseObject<boolean>>(`${this.url}/${id}`, model);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }

  reorder$(items: { id: string; sortOrder: number }[]): Observable<ResponseObject<boolean>> {
    return this.httpClient.put<ResponseObject<boolean>>(`${this.url}/reorder`, items);
  }
}
