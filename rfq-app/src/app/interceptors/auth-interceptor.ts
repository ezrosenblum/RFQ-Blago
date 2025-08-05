import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: Auth, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    let headers = req.headers;

    // Add Authorization token
    if (authToken) {
      headers = headers.set('Authorization', `Bearer ${authToken}`);
    }

    // 👇 Check custom header
    const skipContentType = req.headers.get('Skip-Content-Type') === 'true';

    // 👇 Only set JSON headers if not skipping
    if (!skipContentType) {
      headers = headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
    } else {
      // Remove the custom flag from outgoing request
      headers = headers.delete('Skip-Content-Type');
    }

    const clonedRequest = req.clone({ headers });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Error handling...
        return throwError(() => error);
      })
    );
  }
}
