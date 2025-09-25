import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const addTokenHeader = (request: HttpRequest<any>, token: string) =>
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

  const authToken = authService.getAccessToken();
  const authReq = authToken ? addTokenHeader(req, authToken) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/Auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const newAuthReq = addTokenHeader(req, response.accessToken);
            return next(newAuthReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
