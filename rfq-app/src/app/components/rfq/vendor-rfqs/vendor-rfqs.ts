// src/app/rfq/vendor-rfqs/vendor-rfqs.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  Category,
  LookupValue,
  Rfq,
  RfqStatistics,
  RfqStatus,
  Subcategory,
  SubmissionTableRequest,
  TableResponse,
} from '../../../models/rfq.model';
import { User, UserRole } from '../../../models/user.model';
import { Auth } from '../../../services/auth';
import { RfqService } from '../../../services/rfq';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vendor-rfqs',
  standalone: false,
  templateUrl: './vendor-rfqs.html',
  styleUrls: ['./vendor-rfqs.scss'],
})
export class VendorRfqs implements OnInit, OnDestroy {
  rfqs: Rfq[] = [];
  filteredRfqs: Rfq[] = [];
  currentUser: User | null = null;
  isLoading = false;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';
  submissionListRequest: SubmissionTableRequest = {
    paging: {
      pageNumber: 1,
      pageSize: 10,
    },
    sorting: {
      field: 1,
      sortOrder: 2,
    },
  };

  // Filter form
  filterForm!: FormGroup;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // View options
  viewMode: 'card' | 'table' = 'card';
  sortBy: 1 | 2 | 3 | 4 = 1;
  sortDirection: 'asc' | 'desc' = 'desc';

  // Statistics
  statistics: RfqStatistics = {
    submissionsCount: 0,
    pendingSubmissionsCount: 0,
    reviewedSubmissionsCount: 0,
    acceptedSubmissionsCount: 0,
    rejectedSubmissionsCount: 0,
    last24HoursSubmissionsCount: 0,
  };

  private destroy$ = new Subject<void>();

  // Expose enums to template
  RfqStatus = RfqStatus;
  UserRole = UserRole;
  userId: number | null = null;

  // Filter options
  statusOptions: LookupValue[] = [];
  categoryOptions: Category[] = [];
  subcategoryOptions: Subcategory[] = [];
  categoryDropdownOpen = false;
  subcategoryDropdownOpen = false;
  showAllCategories = false;
  showAllSubcategories = false;

  sortOptions = [
    { value: 1, label: 'Submission Date' },
    { value: 2, label: 'Description' },
    { value: 3, label: 'Quantity' },
    { value: 4, label: 'JobLocation' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private rfqService: RfqService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    // Check authentication and user role
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (this.currentUser?.type == UserRole.CLIENT) {
          this.submissionListRequest.userId = this.currentUser.id;
        }

        if (user) {
          if (user.type === UserRole.CLIENT) {
            this.userId = user.id;
          }
          this.applyFilters();
          this.loadStatistics();
          this.loadStatuses();
          this.loadCategories();

          this.filterForm
            .get('category')!
            .valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((categoryId) => {
              this.onCategoryChange(Number(categoryId));
            });
        }
      });

    // Watch for filter changes
    this.setupFilterWatchers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStatuses(): void {
    this.rfqService
      .getRfqStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => {
          this.statusOptions = statuses;
        },
        error: () => {
          this.errorMessage = this.translate.instant('VENDOR.LOAD_STATUSES');
        },
      });
  }

  loadCategories(): void {
    this.rfqService
      .getRfqSCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categoryOptions = categories;
          this.updateSubcategoriesFromSelected();
        },
        error: () => {
          this.errorMessage = this.translate.instant('VENDOR.LOAD_CATEGORIES');
        },
      });
  }

  onCategoryChange(categoryId: number) {
    const selectedCategory = this.categoryOptions.find(
      (c) => Number(c.id) === categoryId
    );
    if (selectedCategory) {
      this.subcategoryOptions = selectedCategory.subcategories;
      this.filterForm.get('subcategory')!.setValue(null);
    } else {
      this.subcategoryOptions = [];
      this.filterForm.get('subcategory')!.setValue(null);
    }
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      status: [null],
      category: [[]],
      subcategory: [[]],
      dateFrom: [''],
      dateTo: [''],
    });
  }

  private setupFilterWatchers(): void {
    // Search field with debounce
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    // Other filters without debounce
    this.filterForm
      .get('status')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm
      .get('category')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm
      .get('subcategory')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm
      .get('dateFrom')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.filterForm
      .get('dateTo')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  loadRfqs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.rfqService
      .getAllRfqs(this.submissionListRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TableResponse<Rfq>) => {
          this.rfqs = Array.isArray(response.items)
            ? response.items
            : response.items
            ? [response.items]
            : [];
          this.totalItems = response.totalCount!;
          this.totalPages = response.totalPages!;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.handleError(error);
        },
      });
  }

  loadStatistics(): void {
    this.rfqService
      .getRfqStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: () => {
          this.errorMessage = this.translate.instant('VENDOR.LOAD_STATISTICS');
        },
      });
  }

  applyFilters(): void {
    this.submissionListRequest.query =
      this.filterForm.get('search')?.value.trim() || undefined;
    this.submissionListRequest.userId = this.userId!;
    const statusVal = this.filterForm.get('status')?.value;
    this.submissionListRequest.status =
      typeof statusVal === 'number' ? statusVal : undefined;
    this.submissionListRequest.category =
      this.filterForm.get('category')?.value || [];
    this.submissionListRequest.subcategory =
      this.filterForm.get('subcategory')?.value || [];
    this.submissionListRequest.dateFrom =
      this.filterForm.get('dateFrom')?.value.trim() || undefined;
    this.submissionListRequest.dateTo =
      this.filterForm.get('dateTo')?.value.trim() || undefined;
    this.submissionListRequest.paging.pageNumber = this.currentPage;
    this.submissionListRequest.paging.pageSize = this.pageSize;
    this.rfqService
      .getAllRfqs(this.submissionListRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TableResponse<Rfq>) => {
          this.filteredRfqs = Array.isArray(response.items)
            ? response.items
            : response.items
            ? [response.items]
            : [];
          this.totalItems = response.totalCount!;
          this.totalPages = response.totalPages!;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  private sortRfqs(rfqs: Rfq[]): Rfq[] {
    return [...rfqs].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy) {
        case 1:
          comparison =
            new Date(b.submissionDate!).getTime() -
            new Date(a.submissionDate!).getTime();
          break;
        case 2:
          comparison =
            new Date(a.submissionDate!).getTime() -
            new Date(b.submissionDate!).getTime();
          break;
        case 3:
          comparison = (a.status?.id ?? 0) - (b.status?.id ?? 0);
          break;
        case 4:
          comparison = (a.quantity ?? 0) - (b.quantity ?? 0);
          break;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  updateRfqStatus(rfqId: number, newStatus: any): void {
    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.rfqService
      .updateRfqStatus(rfqId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRfq) => {
          this.isUpdating = false;
          this.successMessage = this.translate.instant('VENDOR.STATUS_UPDATED');
          this.loadStatistics();
          this.loadRfqs();
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isUpdating = false;
          this.handleError(error);
        },
      });
  }

  private handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = this.translate.instant('ERROR.SESSION_EXPIRED');
      this.authService.logout();
    } else if (error.status === 403) {
      this.errorMessage = this.translate.instant('ERROR.NO_PERMISSION');
    } else if (error.status === 0) {
      this.errorMessage = this.translate.instant('ERROR.NO_CONNECTION');
    } else {
      this.errorMessage =
        error.error?.message || this.translate.instant('ERROR.LOAD_RFQS');
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

  setSorting(sortBy: number): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy as any;
      this.sortDirection = 'desc';
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: null,
      category: [],
      subcategory: [],
      dateFrom: '',
      dateTo: '',
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

  getStatusColor(status: LookupValue): string {
    return this.rfqService.getStatusColor(status);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
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
    return !!(
      values.search ||
      values.status ||
      values.category?.length > 0 ||
      values.subcategory?.length > 0 ||
      values.dateFrom ||
      values.dateTo
    );
  }

  getFilterCount(): number {
    const values = this.filterForm.value;
    let count = 0;
    if (values.search) count++;
    if (values.status) count++;
    if (values.category?.length > 0) count++;
    if (values.subcategory?.length > 0) count++;
    if (values.dateFrom) count++;
    if (values.dateTo) count++;
    return count;
  }

  // Track by function for ngFor performance
  trackByRfqId(index: number, rfq: Rfq): number {
    return rfq.id!;
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || '?';
  }

  getUnitColor(unitName: string): string {
    const unitColors: { [key: string]: string } = {
      'l f': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      's f':
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'e a':
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };

    return (
      unitColors[unitName.toLowerCase()] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    );
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }
  get isSubcategoryDisabled(): boolean {
    const cats: number[] = this.filterForm.value.category || [];
    return !cats || cats.length === 0;
  }
  toggleSubcategoryDropdown(): void {
    if (this.isSubcategoryDisabled) {
      this.flashInfo(this.translate.instant('VENDOR.PLEASE_SELECT_CATEGORIES'));
      return;
    }
    this.subcategoryDropdownOpen = !this.subcategoryDropdownOpen;
  }
  private flashInfo(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => {
      if (this.errorMessage === msg) this.errorMessage = '';
    }, 2500);
  }
  onCategoryCheckboxChange(event: any): void {
    const selected = this.filterForm.value.category || [];
    const id = +event.target.value;

    if (event.target.checked) {
      selected.push(id);
    } else {
      const index = selected.indexOf(id);
      if (index > -1) selected.splice(index, 1);
    }

    this.filterForm.get('category')?.setValue([...selected]);
    this.updateSubcategoriesFromSelected();
  }

  onSubcategoryCheckboxChange(event: any): void {
    const selected = this.filterForm.value.subcategory || [];
    const id = +event.target.value;

    if (event.target.checked) {
      selected.push(id);
    } else {
      const index = selected.indexOf(id);
      if (index > -1) selected.splice(index, 1);
    }

    this.filterForm.get('subcategory')?.setValue([...selected]);
  }

  updateSubcategoriesFromSelected(): void {
    const selectedCategoryIds = this.filterForm.value.category || [];
    const selectedCategories = this.categoryOptions.filter((c) =>
      selectedCategoryIds.includes(c.id)
    );

    const allSubcategories = selectedCategories.flatMap(
      (c) => c.subcategories || []
    );
    this.subcategoryOptions = allSubcategories;

    // Optional cleanup: remove unselected subcategories
    const selectedSubcatIds = this.filterForm.value.subcategory || [];
    const validSubcatIds = new Set(allSubcategories.map((sc) => sc.id));
    const filteredSubcats = selectedSubcatIds.filter((id: any) =>
      validSubcatIds.has(id)
    );

    this.filterForm.get('subcategory')?.setValue(filteredSubcats);
  }

  getCategoryDisplayText(): string {
    const selectedIds = this.filterForm.value.category || [];
    if (selectedIds.length === 0) {
      return this.translate.instant('VENDOR.SELECT_CATEGORIES');
    }

    const selectedNames = this.categoryOptions
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name);

    return selectedNames.join(', ');
  }

  getSubcategoryDisplayText(): string {
    const selectedIds = this.filterForm.value.subcategory || [];
    if (selectedIds.length === 0) {
      return this.translate.instant('VENDOR.SELECT_SUBCATEGORIES');
    }

    const selectedNames = this.subcategoryOptions
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name);

    return selectedNames.join(', ');
  }

  // Expose Math to template
  Math = Math;
}
