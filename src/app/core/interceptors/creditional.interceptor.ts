import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IS_CHECK_AUTH } from '@interceptors';
import { AuthService } from '@services';
import { catchError, throwError } from 'rxjs';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isCheckAuthRequest = req.context.get(IS_CHECK_AUTH);
      
      if (error.status === 401 && !isCheckAuthRequest) {
        console.warn('Сессия истекла или пользователь не авторизован');
        authService.logout();
      }

      return throwError(() => error);
    }),
  );
};
