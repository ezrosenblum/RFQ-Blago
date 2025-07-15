import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Get the auth token from the service
    const authToken = this.authService.getToken();

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Add common headers
    authReq = authReq.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Handle the request and catch any errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // Handle different error status codes
        switch (error.status) {
          case 401:
            // Unauthorized - token expired or invalid
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            break;

          case 403:
            // Forbidden - user doesn't have permission
            this.router.navigate(['/auth/login']);
            break;

          case 500:
            // Server error
            console.error('Server error:', error);
            break;

          default:
            console.error('HTTP error:', error);
            break;
        }

        return throwError(() => error);
      })
    );
  }
};
