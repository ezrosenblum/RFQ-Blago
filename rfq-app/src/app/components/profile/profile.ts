import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceAreasComponent } from './service-areas/service-areas.component';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild(ServiceAreasComponent) serviceAreasComponent!: ServiceAreasComponent;
  currentUser: User | null = null;

  editMode = false;
  imageError = false;
  selectedTab: string = 'Overview';
  private destroy$ = new Subject<void>();
  private previousTab: string = 'Overview';

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
          this.previousTab = this.selectedTab;
          this.selectedTab = tab;
          this.handleTabSwitch();
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.selectedTab === 'Service_Areas') {
      this.reinitializeServiceAreasMap();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleTabSwitch(): void {
    if (this.selectedTab === 'Service_Areas' && this.previousTab !== 'Service_Areas') {
      setTimeout(() => {
        this.reinitializeServiceAreasMap();
      }, 100);
    }
  }

  private reinitializeServiceAreasMap(): void {
    if (this.serviceAreasComponent) {
      this.serviceAreasComponent.onTabFocus();
    }
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
    this.previousTab = this.selectedTab;
    this.selectedTab = this.tabLabels[event.index];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.selectedTab },
      queryParamsHandling: 'merge',
    });

    this.handleTabSwitch();
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
