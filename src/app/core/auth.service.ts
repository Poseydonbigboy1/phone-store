import { inject, Injectable } from '@angular/core';
import { AuthHttpService } from './backend';
import { BehaviorSubject, lastValueFrom, Observable, switchMap, tap } from 'rxjs';
import { User } from '@models/data';
import { Nullable } from 'primeng/ts-helpers';
import { Router } from '@angular/router';
import { CartService } from './services/cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public user$: Observable<Nullable<User>>;

  private currentUser$: BehaviorSubject<Nullable<User>> = new BehaviorSubject<Nullable<User>>(null);

  private readonly _router: Router;

  private readonly cartService = inject(CartService);

  constructor(private authHttpService: AuthHttpService) {
    this._router = inject(Router);
    this.user$ = this.currentUser$.asObservable();
  }

  async initializeApp() {
    try {
      const data = await lastValueFrom(this.getProfile$(true));
      return data;
    } catch (error) {
      console.warn('Пользователь не авторизован или сервер недоступен, загружаем как гостя');
      return null;
    }
  }

  auth(login: string, password: string): void {
    this.authHttpService
      .login$({ login, password })
      .pipe(switchMap((sw) => this.getProfile$()))
      .subscribe({
        next: (res) => {
          this.cartService.mergeOnLogin();
          this._router.navigate(['main']);
          console.log(`[auth] [succes]`, res);
        },
        error: (err0r) => {
          console.log(`[auth] [err]`, err0r);
        },
      });
  }

  register(name: string, login: string, password: string, onError?: (msg: string) => void): void {
    this.authHttpService
      .register$({ name, login, password })
      .pipe(switchMap(() => this.getProfile$()))
      .subscribe({
        next: () => {
          this.cartService.mergeOnLogin();
          this._router.navigate(['main']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Ошибка регистрации';
          onError?.(msg);
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
            user.id    = response.data.id ?? '';
            user.login = response.data.login;
            user.name  = response.data.name ?? '';
            user.role  = response.data.role;

            this.currentUser$.next(user);
          } else {
            // Ответ пришёл, но без данных пользователя — сбрасываем сессию
            this.currentUser$.next(null);
          }
        },
        error: () => {
          // 401 / network error — пользователь не авторизован
          this.currentUser$.next(null);
        },
      }),
    );
  }

  isLoggedIn(): boolean {
    return this.currentUser$.value !== null;
  }
}
