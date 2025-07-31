// src/app/shared/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { User, UserRole } from '../../models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAuthenticated = false;
  isDarkMode = false;
  isMenuOpen = false;

  private destroy$ = new Subject<void>();

  // Expose UserRole enum to template
  UserRole = UserRole;

  constructor(
    private authService: Auth,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Initialize theme from localStorage
    this.initializeTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTheme(): void {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      // Check system preference
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateToLogin(): void {
    this.closeMenu();
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup(): void {
    this.closeMenu();
    this.router.navigate(['/auth/signup']);
  }

  navigateToRequestQuote(): void {
    this.closeMenu();
    this.router.navigate(['/request-quote']);
  }

  navigateToVendorRfqs(): void {
    this.closeMenu();
    this.router.navigate(['/vendor-rfqs']);
  }

  navigateToHome(): void {
    this.closeMenu();
    this.router.navigate(['/']);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';

    if (this.currentUser.firstName || this.currentUser.lastName) {
      return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
    }

    return this.currentUser.email;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';

    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';

    if (firstName || lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    return this.currentUser.email.charAt(0).toUpperCase();
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.type) {
      case UserRole.VENDOR:
        return this.translate.instant('HEADER.VENDOR');
      case UserRole.CLIENT:
        return this.translate.instant('HEADER.CLIENT');
      default:
        return '';
    }
  }

  canAccessVendorRfqs(): boolean {
    return this.isAuthenticated;
  }

  canAccessRequestQuote(): boolean {
    return !this.currentUser || (this.isAuthenticated && this.currentUser?.type === UserRole.CLIENT)
  }


  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }
}
