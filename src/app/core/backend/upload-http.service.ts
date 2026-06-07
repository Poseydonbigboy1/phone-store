import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseObject } from '@models/common';
import { HttpBase } from './http-base';

@Injectable({ providedIn: 'root' })
export class UploadHttpService extends HttpBase {
  private readonly url = `${this.apiUrl}/Upload`;

  uploadImage$(file: File): Observable<ResponseObject<string>> {
    const form = new FormData();
    form.append('file', file);
    return this.httpClient.post<ResponseObject<string>>(`${this.url}/image`, form);
  }
}
