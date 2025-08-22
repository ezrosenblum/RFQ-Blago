import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { Token } from '../models/auth.model';

@Injectable()
export class HttpHeaderInterceptor implements HttpInterceptor {
  constructor(private _authService: Auth, private _router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this._authService.getToken();

    const skipContentType = request.headers.get('Skip-Content-Type') === 'true';
    let headers = request.headers;

    const isFormData = request.body instanceof FormData;
    const shouldSetJson =
      !skipContentType && !isFormData && request.method !== 'GET';

    if (shouldSetJson) {
      headers = headers.set('Content-Type', 'application/json')
                       .set('Accept', 'application/json');
    }
    if (skipContentType) {
      headers = headers.delete('Skip-Content-Type');
    }

    const excludeUrls = [
      { url: 'Authenticate/login', methods: ['POST'] },
      { url: 'Authenticate/verify', methods: ['PUT'] },
      { url: 'Authenticate/verify/resend-code', methods: ['PUT'] },
      { url: 'Authenticate/refresh-token', methods: ['POST'] },
      { url: 'User', methods: ['POST'] },
      { url: 'User/forgot-password', methods: ['POST'] },
      { url: 'User/reset-password', methods: ['POST'] },
    ];

    const isExcluded = excludeUrls.some(
      e => request.url.endsWith(e.url) && e.methods.includes(request.method)
    );

    if (!isExcluded && token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const cloned = request.clone({ headers });

    return next.handle(cloned).pipe(
      catchError((originalError: HttpErrorResponse) => {
        const hasRefresh = !!this._authService.getRefreshToken?.();
        const isRefreshCall = request.url.endsWith('Authenticate/refresh-token');

        if (
          originalError.status === 401 &&
          !isExcluded &&              
          !isRefreshCall &&
          hasRefresh
        ) {
          return this.handleUnauthorizedError(request, next, originalError);
        }
        return throwError(() => originalError);
      })
    );
  }

  private handleUnauthorizedError(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    originalError: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    return this._authService.generateRefreshToken().pipe(
      switchMap((newTokens: Token) => {
        this._authService.saveTokens(newTokens);
        return next.handle(this.addTokenHeader(request, newTokens.accessToken));
      }),
      catchError((_refreshErr) => {
        this._authService.logout();
        return throwError(() => originalError);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<unknown>, accessToken: string): HttpRequest<unknown> {
    const skipContentType = request.headers.get('Skip-Content-Type') === 'true';
    const isFormData = request.body instanceof FormData;
    const shouldSetJson = !skipContentType && !isFormData && request.method !== 'GET';

    let headers = request.headers.set('Authorization', `Bearer ${accessToken}`);
    if (shouldSetJson) {
      headers = headers.set('Content-Type', 'application/json')
                       .set('Accept', 'application/json');
    } else if (skipContentType) {
      headers = headers.delete('Skip-Content-Type');
    }

    return request.clone({ headers });
  }
}
