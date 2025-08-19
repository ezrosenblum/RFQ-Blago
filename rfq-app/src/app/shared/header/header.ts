// src/app/shared/header/header.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { User, UserRole } from '../../models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationData } from '../../services/notification-data';
import { NotificationItem } from '../../models/notifications.model';
import { SORT_ORDER } from '../shared.model';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAuthenticated = false;
  isDarkMode = false;
  isMenuOpen = false;
  imageLoadError = false;
  notificationCount: number = 0;
  notifications: NotificationItem[] = [];
  showNotificationsDropdown = false;
  loadingStatusChange: { [notificationId: string]: boolean } = {};
  currentPage = 1;
  pageSize = 5;
  isLoadingMore = false;
  hasMoreNotifications = true;

  private destroy$ = new Subject<void>();
  @ViewChild('notifContainer') notifContainer!: ElementRef;

  // Expose UserRole enum to template
  UserRole = UserRole;

  constructor(
    private authService: Auth,
    private router: Router,
    private translate: TranslateService,
    private notificationDataService: NotificationData
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuth) => {
        this.isAuthenticated = isAuth;
      });

    // Initialize theme from localStorage
    this.initializeTheme();
    this.getNotificationCount();
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
      this.isDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
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

  navigateToMyQuotes(): void {
    this.closeMenu();
    this.router.navigate(['/my-quotes']);
  }

  navigateToMessages(): void {
    this.closeMenu();
    this.router.navigate(['/messages']);
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
      return `${this.currentUser.firstName || ''} ${
        this.currentUser.lastName || ''
      }`.trim();
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
      case UserRole.ADMIN:
        return this.translate.instant('HEADER.ADMIN');
      default:
        return '';
    }
  }

  canAccessVendorRfqs(): boolean {
    return this.isAuthenticated;
  }

  canAccessRequestQuote(): boolean {
    return (
      !this.currentUser ||
      (this.isAuthenticated && this.currentUser?.type === UserRole.CLIENT)
    );
  }

  canAccessMyQuotes(): boolean {
    return this.isAuthenticated && this.currentUser?.type === UserRole.VENDOR;
  }

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  getNotificationCount() {
    this.notificationDataService.getNotificationCount().subscribe({
      next: (result) => {
        this.notificationCount = result?.count || 0;
        this.hasMoreNotifications = true;
        this.getNotifications(1);
      },
      error: (err) => console.error('Failed to get notification count:', err),
    });
  }

  toggleNotificationsDropdown(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;

    if (this.showNotificationsDropdown) {
      this.currentPage = 1;
      this.hasMoreNotifications = true;
      this.notifications = [];
      this.getNotifications(1);
    }
  }

  getNotifications(page = 1) {
    if (this.isLoadingMore || !this.hasMoreNotifications) return;

    this.isLoadingMore = true;

    const searchParams = {
      query: '',
      paging: {
        pageNumber: page,
        pageSize: this.pageSize,
      },
      sorting: {
        field: 1,
        sortOrder: SORT_ORDER.DESCENDING,
      },
    };

    this.notificationDataService.getNotificationsPaged(searchParams).subscribe({
      next: (result) => {
        const newNotifications = result?.items || [];
        if (page === 1) {
          this.notifications = newNotifications;
        } else {
          this.notifications = [...this.notifications, ...newNotifications];
        }

        this.hasMoreNotifications = newNotifications.length === this.pageSize;
        this.currentPage = page;
        this.isLoadingMore = false;
      },
      error: (err) => {
        this.isLoadingMore = false;
      },
    });
  }

  markAllAsRead(): void {
    this.notificationDataService.markAllAsReadNotification().subscribe({
      next: () => {
        this.getNotificationCount();
      },
      error: (err) => console.error('Failed to mark all as read:', err),
    });
  }

  toggleNotificationStatus(notification: NotificationItem): void {
    const currentStatusId = notification.status?.id;
    const newStatusId = currentStatusId === 1 ? 2 : 1;

    this.loadingStatusChange[notification.id] = true;

    this.notificationDataService
      .changeStatus(notification.id, newStatusId)
      .subscribe({
        next: () => {
          const index = this.notifications.findIndex(
            (n) => n.id === notification.id
          );
          if (index > -1) {
            this.notifications[index].status.id = newStatusId;
          }
          this.getNotificationCount();
        },
        error: (err) => {
          console.error('Failed to toggle notification status:', err);
        },
        complete: () => {
          this.loadingStatusChange[notification.id] = false;
        },
      });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    if (scrollBottom < 50 && this.hasMoreNotifications && !this.isLoadingMore) {
      this.getNotifications(this.currentPage + 1);
    }
  }

  onImageError(): void {
    this.imageLoadError = true;
  }

  navigateFromNotification(notif: NotificationItem): void {
    try {
      const data = JSON.parse(notif.data);

      if (notif.status.id === 2) {
        this.loadingStatusChange[notif.id] = true;
        this.notificationDataService
          .changeStatus(notif.id, 1)
          .subscribe({
            next: () => {
              const index = this.notifications.findIndex(n => n.id === notif.id);
              if (index > -1) {
                this.notifications[index].status.id = 1;
              }
              this.getNotificationCount();

              this.performNavigation(notif, data);
            },
            error: (err) => {
              console.error('Failed to mark notification as read:', err);
              this.performNavigation(notif, data);
            },
            complete: () => {
              this.loadingStatusChange[notif.id] = false;
            }
          });
      } else {
        this.performNavigation(notif, data);
      }

    } catch (error) {
      console.error('Error parsing notification data:', error);
    }
  }

  private performNavigation(notif: NotificationItem, data: any): void {
    this.showNotificationsDropdown = false;

    if (notif.type.id === 1) {
      const submissionId = data.SubmissionId;
      if (submissionId) {
        this.router.navigate(['/vendor-rfqs', submissionId]);
      }
    } else if (notif.type.id === 2) {
      const quoteId = data.QuoteId;
      if (quoteId) {
        this.router.navigate(['/quote-details', quoteId]);
      }
    } else if (notif.type.id === 3) {
      const submissionQuoteId = data.SubmissionQuoteId;
      if (submissionQuoteId) {
        this.router.navigate(['/messages'], { queryParams: { quoteId: submissionQuoteId } });
      }
    }
  }

}
