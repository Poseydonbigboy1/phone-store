import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Component } from '@models/data';
import { ComponentFilter, FilterResult, ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class ComponentsHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Component`;

  getAll$(filter: ComponentFilter): Observable<ResponseObject<FilterResult<Component>>> {
    return this.httpClient.post<ResponseObject<FilterResult<Component>>>(`${this.url}/filter`, filter);
  }

  create$(item: Partial<Component>): Observable<ResponseObject<Component>> {
    return this.httpClient.post<ResponseObject<Component>>(this.url, item);
  }

  update$(item: Component): Observable<ResponseObject<Component>> {
    return this.httpClient.put<ResponseObject<Component>>(this.url, item);
  }

  delete$(id: string): Observable<ResponseObject<boolean>> {
    return this.httpClient.delete<ResponseObject<boolean>>(`${this.url}/${id}`);
  }
}
