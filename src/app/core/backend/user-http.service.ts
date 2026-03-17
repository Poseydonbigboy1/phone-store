import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { HttpBase } from "./http-base";

@Injectable({ providedIn: 'root' })
export class UserHttpService extends HttpBase {
    constructor(private httpClient: HttpClient) {
        super();
    }

    public getUserById$(id: string): Observable<any> {
        return this.httpClient.get(`${this.apiUrl}/User/${id}`).pipe(take(1));
    }

    public getUsers$(filter: any = null): Observable<any> {
        return this.httpClient.post(`${this.apiUrl}/User`, filter).pipe(take(1));
    }
}