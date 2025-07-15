// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { User, UserRole } from '../models/user.model';
import { LoginRequest, SignupRequest, AuthResponse, TokenPayload } from '../models/auth.model';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'rfq_auth_token';
  private readonly USER_KEY = 'rfq_current_user';
  private readonly DEMO_MODE = true; // Set to false when connecting to real API

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  public redirectUrl: string | null = null;

  // Demo accounts database
  private demoUsers: User[] = [
    {
      id: 'demo-vendor-1',
      email: 'vendor@demo.com',
      firstName: 'John',
      lastName: 'Vendor',
      role: UserRole.VENDOR,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'demo-client-1',
      email: 'client@demo.com',
      firstName: 'Jane',
      lastName: 'Client',
      role: UserRole.CLIENT,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  private demoPasswords: { [email: string]: string } = {
    'vendor@demo.com': 'demo123',
    'client@demo.com': 'demo123'
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (this.DEMO_MODE) {
      return this.demoLogin(credentials);
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Login failed');
        }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
        })
      );
  }

  private demoLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        const user = this.demoUsers.find(u => u.email === credentials.email.toLowerCase());
        const expectedPassword = this.demoPasswords[credentials.email.toLowerCase()];

        if (!user || expectedPassword !== credentials.password) {
          throw new Error('Invalid email or password');
        }

        // Generate demo JWT token
        const token = this.generateDemoToken(user);

        const authResponse: AuthResponse = {
          token,
          user,
          expiresIn: 86400 // 24 hours
        };

        this.handleAuthSuccess(authResponse);
        return authResponse;
      })
    );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    if (this.DEMO_MODE) {
      return this.demoSignup(userData);
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/signup`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Signup failed');
        }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
        })
      );
  }

  private demoSignup(userData: SignupRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        // Check if user already exists
        const existingUser = this.demoUsers.find(u => u.email === userData.email.toLowerCase());
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Create new demo user
        const newUser: User = {
          id: `demo-${userData.role}-${Date.now()}`,
          email: userData.email.toLowerCase(),
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || UserRole.CLIENT,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Add to demo database
        this.demoUsers.push(newUser);
        this.demoPasswords[newUser.email] = userData.password;

        // Generate demo JWT token
        const token = this.generateDemoToken(newUser);

        const authResponse: AuthResponse = {
          token,
          user: newUser,
          expiresIn: 86400 // 24 hours
        };

        this.handleAuthSuccess(authResponse);
        return authResponse;
      })
    );
  }

  private generateDemoToken(user: User): string {
    // Create a demo JWT-like token (not cryptographically secure, just for demo)
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payload = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    }));
    const signature = btoa('demo-signature');

    return `${header}.${payload}.${signature}`;
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private handleAuthSuccess(authResponse: AuthResponse): void {
    // Store token and user data in localStorage
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));

    // Update subjects
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);

    // Redirect to intended page or default
    const redirectUrl = this.redirectUrl || '/request-quote';
    this.redirectUrl = null;
    this.router.navigate([redirectUrl]);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
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
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isVendor(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  isClient(): boolean {
    return this.hasRole(UserRole.CLIENT);
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.DEMO_MODE) {
      // In demo mode, just refresh the current token
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const newToken = this.generateDemoToken(currentUser);
        const authResponse: AuthResponse = {
          token: newToken,
          user: currentUser,
          expiresIn: 86400
        };

        localStorage.setItem(this.TOKEN_KEY, newToken);
        return of(authResponse);
      }
      return throwError(() => new Error('No user to refresh token for'));
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Token refresh failed');
        }),
        tap(authResponse => {
          localStorage.setItem(this.TOKEN_KEY, authResponse.token);
          this.currentUserSubject.next(authResponse.user);
        })
      );
  }

  // Method to get all demo users (for testing purposes)
  getDemoUsers(): User[] {
    return this.DEMO_MODE ? [...this.demoUsers] : [];
  }

  // Method to switch between demo and real API mode
  setDemoMode(enabled: boolean): void {
    // This would typically be set via environment variables
    console.log(`Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Update user profile
  updateProfile(updates: Partial<User>): Observable<User> {
    if (this.DEMO_MODE) {
      return of(null).pipe(
        delay(500),
        map(() => {
          const currentUser = this.getCurrentUser();
          if (!currentUser) {
            throw new Error('No user logged in');
          }

          const updatedUser: User = {
            ...currentUser,
            ...updates,
            updatedAt: new Date()
          };

          // Update in demo database
          const index = this.demoUsers.findIndex(u => u.id === currentUser.id);
          if (index !== -1) {
            this.demoUsers[index] = updatedUser;
          }

          // Update localStorage and subjects
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);

          return updatedUser;
        })
      );
    }

    return this.http.put<ApiResponse<User>>(`${this.API_URL}/auth/profile`, updates)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Profile update failed');
        }),
        tap(user => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
}
