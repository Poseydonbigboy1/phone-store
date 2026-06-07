import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponentCategory } from '@models/data';
import { ComponentCategoryFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class ComponentCategoriesHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/ComponentCategory`;

  getAll$(filter: ComponentCategoryFilter): Observable<ResponseObject<FilterResult<ComponentCategory>>> {
    return this.httpClient.post<ResponseObject<FilterResult<ComponentCategory>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<ComponentCategory>): Observable<ResponseObject<ComponentCategory>> {
    return this.httpClient.post<ResponseObject<ComponentCategory>>(this.url, item);
  }

  update$(item: ComponentCategory): Observable<ResponseObject<ComponentCategory>> {
    return this.httpClient.put<ResponseObject<ComponentCategory>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
