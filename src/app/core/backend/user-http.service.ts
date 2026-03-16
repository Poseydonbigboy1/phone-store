import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class UserHttpService {
    constructor(private httpClient: HttpClient) { }

    public getUserById$(id: string): Observable<any> {
        return this.httpClient.get('');
    }

    public getUsers$(filter: any): Observable<any> {
        return this.httpClient.post('', filter)
    }
}