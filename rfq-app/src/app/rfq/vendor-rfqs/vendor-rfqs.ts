// src/app/rfq/vendor-rfqs/vendor-rfqs.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Auth } from '../../services/auth';
import { RfqService } from '../../services/rfq';
import { Rfq, RfqStatus, UnitType } from '../../models/rfq.model';
import { User, UserRole } from '../../models/user.model';
import { PaginatedResponse } from '../../models/api-response';

@Component({
  selector: 'app-vendor-rfqs',
  standalone: false,
  templateUrl: './vendor-rfqs.html',
  styleUrls: ['./vendor-rfqs.scss']
})
export class VendorRfqs implements OnInit, OnDestroy {
  rfqs: Rfq[] = [];
  filteredRfqs: Rfq[] = [];
  currentUser: User | null = null;
  isLoading = false;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';

  // Filter form
  filterForm!: FormGroup;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // View options
  viewMode: 'card' | 'table' = 'card';
  sortBy: 'newest' | 'oldest' | 'status' | 'quantity' = 'newest';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Statistics
  statistics = {
    total: 0,
    pending: 0,
    reviewed: 0,
    quoted: 0,
    rejected: 0,
    recentCount: 0
  };

  private destroy$ = new Subject<void>();

  // Expose enums to template
  RfqStatus = RfqStatus;
  UnitType = UnitType;
  UserRole = UserRole;

  // Filter options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: RfqStatus.PENDING, label: 'Pending Review' },
    { value: RfqStatus.REVIEWED, label: 'Under Review' },
    { value: RfqStatus.QUOTED, label: 'Quoted' },
    { value: RfqStatus.REJECTED, label: 'Rejected' }
  ];

  unitOptions = [
    { value: '', label: 'All Units' },
    { value: UnitType.LF, label: 'Linear Feet (LF)' },
    { value: UnitType.SF, label: 'Square Feet (SF)' },
    { value: UnitType.EA, label: 'Each (EA)' }
  ];

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
    { value: 'quantity', label: 'By Quantity' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private rfqService: RfqService,
    private router: Router
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    // Check authentication and user role
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (!user) {
          this.router.navigate(['/auth/login']);
          return;
        }

        // Check if user has access (vendor or admin)
        if (user.role !== UserRole.VENDOR && user.role !== UserRole.ADMIN) {
          this.errorMessage = 'Access denied. This page is only available to vendors and administrators.';
          setTimeout(() => {
            this.router.navigate(['/request-quote']);
          }, 3000);
          return;
        }

        this.loadRfqs();
        this.loadStatistics();
      });

    // Watch for filter changes
    this.setupFilterWatchers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      unit: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  private setupFilterWatchers(): void {
    // Search field with debounce
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    // Other filters without debounce
    this.filterForm.get('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm.get('unit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm.get('dateFrom')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm.get('dateTo')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  loadRfqs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.rfqService.getAllRfqs(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Rfq>) => {
          this.rfqs = response.data;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.handleError(error);
        }
      });
  }

  loadStatistics(): void {
    this.rfqService.getRfqStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Failed to load statistics:', error);
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.rfqService.getFilteredRfqs({
      status: filters.status || undefined,
      unit: filters.unit || undefined,
      search: filters.search || undefined,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
    }, this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Rfq>) => {
          this.filteredRfqs = this.sortRfqs(response.data);
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private sortRfqs(rfqs: Rfq[]): Rfq[] {
    return [...rfqs].sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'newest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updateRfqStatus(rfqId: string, newStatus: RfqStatus): void {
    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.rfqService.updateRfqStatus(rfqId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRfq) => {
          this.isUpdating = false;

          // Update the RFQ in both arrays
          const updateArrays = (array: Rfq[]) => {
            const index = array.findIndex(rfq => rfq.id === rfqId);
            if (index !== -1) {
              array[index] = updatedRfq;
            }
          };

          updateArrays(this.rfqs);
          updateArrays(this.filteredRfqs);

          this.successMessage = `RFQ status updated to ${this.rfqService.getStatusDisplayName(newStatus)}`;
          this.loadStatistics(); // Refresh statistics

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isUpdating = false;
          this.handleError(error);
        }
      });
  }

  private handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      this.authService.logout();
    } else if (error.status === 403) {
      this.errorMessage = 'You do not have permission to view this content.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'An error occurred while loading RFQs.';
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // View and sorting methods
  setViewMode(mode: 'card' | 'table'): void {
    this.viewMode = mode;
  }

  setSorting(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy as any;
      this.sortDirection = 'desc';
    }
    this.filteredRfqs = this.sortRfqs(this.filteredRfqs);
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      unit: '',
      dateFrom: '',
      dateTo: ''
    });
    this.currentPage = 1;
    this.loadRfqs();
  }

  refreshData(): void {
    this.loadRfqs();
    this.loadStatistics();
  }

  navigateToRequestQuote(): void {
    this.router.navigate(['/request-quote']);
  }

  // Utility methods for template
  getStatusDisplayName(status: RfqStatus): string {
    return this.rfqService.getStatusDisplayName(status);
  }

  getStatusColor(status: RfqStatus): string {
    return this.rfqService.getStatusColor(status);
  }

  getUnitDisplayName(unit: UnitType): string {
    return this.rfqService.getUnitDisplayName(unit);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(date);
  }

  truncateText(text: string, length: number = 100): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return !!(values.search || values.status || values.unit || values.dateFrom || values.dateTo);
  }

  getFilterCount(): number {
    const values = this.filterForm.value;
    let count = 0;
    if (values.search) count++;
    if (values.status) count++;
    if (values.unit) count++;
    if (values.dateFrom) count++;
    if (values.dateTo) count++;
    return count;
  }

  // Track by function for ngFor performance
  trackByRfqId(index: number, rfq: Rfq): string {
    return rfq.id;
  }

  // Expose Math to template
  Math = Math;
}
