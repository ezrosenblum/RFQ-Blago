import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { User, UserRole } from '../models/user.model';
import {
  LoginRequest,
  SignupRequest,
  TokenPayload,
  Token,
  PasswordResetRequest,
} from '../models/auth.model';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly API_URL = environment.apiUrl;

  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  public redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    if (token) {
      this.getUserData().pipe(
        map((user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);

          return user;
        })
      );
    }
  }

  login(credentials: LoginRequest): Observable<Token> {
    return this.http
      .post<Token>(`${this.API_URL}Authenticate/login`, credentials)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  resetPassword(data: PasswordResetRequest): Observable<void> {
    return this.http
      .post<void>(`${this.API_URL}/User/reset-password`, data)
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
  getUserData(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}User/me`).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  signup(userData: SignupRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}User`, userData).pipe(
      map((response) => {
        if (response && response.id) {
          return response;
        }
        throw new Error('Signup failed');
      }),
      tap((response) => {
        this.router.navigate(['/auth/login']);
      })
    );
  }

  forgotPassword(forgotPassword: { email: string }): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/User/forgot-password`, forgotPassword
    ).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  saveTokens(authTokens: Token): void {
    localStorage.setItem('rfqTokenAcc', authTokens.accessToken);
    localStorage.setItem('rfqTokenRef', authTokens.refreshToken);
  }

  private clearAuthData(): void {
    localStorage.removeItem('rfqTokenAcc');
    localStorage.removeItem('rfqTokenRef');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('rfqTokenAcc');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private decodeToken(token: string): TokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.type === role;
  }

  isVendor(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  isClient(): boolean {
    return this.hasRole(UserRole.CLIENT);
  }

  // Update user profile
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.API_URL}/auth/profile`, updates)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Profile update failed');
        }),
        tap((user) => {
          this.currentUserSubject.next(user);
        })
      );
  }
}
