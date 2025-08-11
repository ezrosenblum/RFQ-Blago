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

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let token = this._authService.getToken();

    // ===== Skip Content-Type / Accept logic =====
    const skipContentType = request.headers.get('Skip-Content-Type') === 'true';

    let headers = request.headers;

    if (!skipContentType) {
      headers = headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    } else {
      headers = headers.delete('Skip-Content-Type'); // remove custom header
    }

    // ===== Token logic with excludeUrls =====
    const excludeUrls = [
      { url: 'Authenticate/login', methods: ['POST'] },
      { url: 'Authenticate/verify', methods: ['PUT'] },
      { url: 'Authenticate/verify/resend-code', methods: ['PUT'] },
      { url: 'Authenticate/refresh-token', methods: ['POST'] },
      { url: 'User', methods: ['POST'] },
      { url: 'User/forgot-password', methods: ['POST'] },
      { url: 'User/reset-password', methods: ['POST'] }
    ];

    const isExcluded = excludeUrls.some(
      entry =>
        request.url.endsWith(entry.url) &&
        entry.methods.includes(request.method)
    );

    if (!isExcluded && token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const cloned = request.clone({ headers });

    return next.handle(cloned).pipe(
      catchError((errordata) => {
        if (
          errordata.status == 401 &&
          !errordata.url.includes('Authenticate/refresh-token')
        ) {
          return this.handleUnauthorizedError(request, next);
        }
        return throwError(() => errordata);
      })
    );
  }

  private handleUnauthorizedError(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this._authService.generateRefreshToken().pipe(
      switchMap((newTokens: Token) => {
        this._authService.saveTokens(newTokens);
        return next.handle(
          this.addTokenHeader(request, newTokens.accessToken)
        );
      }),
      catchError((error) => {
        this._authService.logout();
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(
    request: HttpRequest<unknown>,
    accessToken: string
  ): HttpRequest<unknown> {
    // reapply skip-content-type logic if needed
    const skipContentType = request.headers.get('Skip-Content-Type') === 'true';

    let headers = request.headers;

    if (!skipContentType) {
      headers = headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    } else {
      headers = headers.delete('Skip-Content-Type');
    }

    return request.clone({
      headers: headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }
}