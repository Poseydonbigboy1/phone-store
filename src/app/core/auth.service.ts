import { inject, Injectable } from '@angular/core';
import { AuthHttpService } from './backend';
import { BehaviorSubject, lastValueFrom, Observable, switchMap, tap } from 'rxjs';
import { User } from '@models/data';
import { Nullable } from 'primeng/ts-helpers';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public user$: Observable<Nullable<User>>;

  private currentUser$: BehaviorSubject<Nullable<User>> = new BehaviorSubject<Nullable<User>>(null);

  private readonly _router: Router;

  constructor(private authHttpService: AuthHttpService) {
    this._router = inject(Router);

    this.user$ = this.currentUser$.asObservable();
  }

  async initializeApp() {
    const data = await lastValueFrom(this.getProfile$(true));
    return data;
  }

  auth(login: string, password: string): void {
    this.authHttpService.login$({ login, password }).pipe(
      switchMap(sw => this.getProfile$())
    ).subscribe({
      next: (res) => {
        console.log(`[auth] [succes]`, res);
        // this.getProfile$();
      },
      error: (err0r) => {
        console.log(`[auth] [err]`, err0r);
      },
    });
  }

  logout(): void {
    this.authHttpService.logout$().subscribe({
      next: (res) => {
        console.log(`[logout] [succes]`, res);
        this.currentUser$.next(null);
        this._router.navigate(['login']);
      },
      error: (err0r) => {
        console.log(`[logout] [err]`, err0r);
      },
    });
  }

  getProfile$(isCheckAuth: boolean = false): Observable<any> {
    return this.authHttpService.getProfile$(isCheckAuth).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            const user = new User();
            user.login = response.data.login;
            user.name = response.data.name;
            user.role = response.data.role;

            this.currentUser$.next(user);
          }
        },
        error: (er0r) => {},
      }),
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser$.value !== null;
  }
}
