import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = targetsConfiguredApi(request.url);
  const token = authService.accessToken();
  const authenticatedRequest =
    isApiRequest && token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (isApiRequest && error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        if (!router.url.startsWith('/login')) {
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
      }

      return throwError(() => error);
    }),
  );
};

function targetsConfiguredApi(requestUrl: string): boolean {
  const browserBase = globalThis.location?.origin ?? 'http://localhost';
  const apiUrl = new URL(environment.apiUrl, browserBase);
  const targetUrl = new URL(requestUrl, browserBase);
  const apiPath = apiUrl.pathname.replace(/\/$/, '');

  return (
    targetUrl.origin === apiUrl.origin &&
    (targetUrl.pathname === apiPath || targetUrl.pathname.startsWith(`${apiPath}/`))
  );
}
