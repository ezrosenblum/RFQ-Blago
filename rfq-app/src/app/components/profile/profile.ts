import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  editMode = false;
  imageError = false;
  selectedTab: string = 'Overview';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const tab = params.get('tab');
        if (
          tab === 'Overview' ||
          tab === 'Settings' ||
          tab === 'Materials' ||
          tab === 'Service_Areas'
        ) {
          this.selectedTab = tab;
        }
      });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
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
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.type) {
      case UserRole.VENDOR:
        return 'Vendor';
      case UserRole.CLIENT:
        return 'Client';
      default:
        return '';
    }
  }
  get tabLabels(): string[] {
    return this.currentUser?.type === UserRole.VENDOR
      ? ['Overview', 'Settings', 'Materials', 'Service_Areas']
      : ['Overview', 'Settings', 'Service_Areas'];
  }

 onTabChange(event: any) {
    this.selectedTab = this.tabLabels[event.index];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.selectedTab },
      queryParamsHandling: 'merge',
    });
  }

  get selectedIndex(): number {
    return this.tabLabels.indexOf(this.selectedTab) !== -1
      ? this.tabLabels.indexOf(this.selectedTab)
      : 0;
  }
  onImageError(): void {
    this.imageError = true;
  }
}
