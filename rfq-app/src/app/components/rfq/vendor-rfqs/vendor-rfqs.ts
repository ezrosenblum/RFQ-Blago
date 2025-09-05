// src/app/rfq/vendor-rfqs/vendor-rfqs.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, take } from 'rxjs';
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
import { MatDialog } from '@angular/material/dialog';
import { QuoteFormDialog } from './quote-form-dialog/quote-form-dialog';
import { AlertService } from '../../../services/alert.service';
import Swal from 'sweetalert2';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
  isLoading = true;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';
  submissionListRequest: SubmissionTableRequest = {
    status: [],
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

  carouselScrollStates: {
    [key: string]: {
      canScrollLeft: boolean;
      canScrollRight: boolean;
      needsScroll: boolean;
    };
  } = {};

  sortOptions = [
    { value: 1, label: 'Submission Date' },
    { value: 2, label: 'Description' },
    { value: 3, label: 'Quantity' },
    { value: 4, label: 'JobLocation' },
  ];

  statusStyles: Record<number, { container: string; dot: string }> = {
    1: {
      // Pending Review
      container: 'bg-yellow-100 text-yellow-800 border border-yellow-400',
      dot: 'text-yellow-500',
    },
    2: {
      // Approved
      container: 'bg-green-100 text-green-800 border border-green-500',
      dot: 'text-green-500',
    },
    3: {
      // Rejected
      container: 'bg-red-100 text-red-800 border border-red-500',
      dot: 'text-red-500',
    },
    4: {
      // Archived
      container: 'bg-gray-100 text-gray-800 border border-gray-400',
      dot: 'text-gray-500',
    },
    5: {
      // Completed
      container: 'bg-blue-100 text-blue-800 border border-blue-500',
      dot: 'text-blue-500',
    },
  };
  showFullDescription = false;
  isOverflowing: Record<string, boolean> = {};
  private initialLoad = true;

  constructor(
    private _fb: FormBuilder,
    private _authService: Auth,
    private _rfqService: RfqService,
    private _router: Router,
    private _translate: TranslateService,
    private _dialog: MatDialog,
    private _alert: AlertService,
    private _route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadFiltersFromQueryParams();

    // Check authentication and user role
    this._authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && (!this.currentUser || this.currentUser.id !== user?.id)) {
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
        }
      });

    // Watch for filter changes
    this.setupFilterWatchers();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.rfqs.forEach((rfq) => {
        const el = document.getElementById('desc-' + rfq.id);
        if (el) {
          this.isOverflowing['desc-' + rfq.id] =
            el.scrollHeight > el.clientHeight;
        }
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFiltersFromQueryParams(): void {
    const queryParams = this._route.snapshot.queryParams;
    
    // Create form values object
    const formValues: any = {
      search: queryParams['search'] || '',
      status: queryParams['status'] ? +queryParams['status'] : null,
      category: queryParams['category'] ? 
        (Array.isArray(queryParams['category']) ? 
          queryParams['category'].map((id: string) => +id) : 
          [+queryParams['category']]) : [],
      subcategory: queryParams['subcategory'] ? 
        (Array.isArray(queryParams['subcategory']) ? 
          queryParams['subcategory'].map((id: string) => +id) : 
          [+queryParams['subcategory']]) : [],
      dateFrom: queryParams['dateFrom'] || '',
      dateTo: queryParams['dateTo'] || ''
    };

    // Update form with query param values
    this.filterForm.patchValue(formValues);

    // Update submission request with query params
    if (queryParams['search']) {
      this.submissionListRequest.query = queryParams['search'];
    }
    
    if (queryParams['status']) {
      this.submissionListRequest.status = [+queryParams['status']];
    }
    
    if (queryParams['category']) {
      (this.submissionListRequest as SubmissionTableRequest).category = Array.isArray(queryParams['category']) ? 
        queryParams['category'].map((id: string) => +id) : 
        [+queryParams['category']];
    }
    
    if (queryParams['subcategory']) {
      (this.submissionListRequest as SubmissionTableRequest).subcategory = Array.isArray(queryParams['subcategory']) ? 
        queryParams['subcategory'].map((id: string) => +id) : 
        [+queryParams['subcategory']];
    }
    
    if (queryParams['dateFrom']) {
      this.submissionListRequest.dateFrom = queryParams['dateFrom'];
    }
    
    if (queryParams['dateTo']) {
      this.submissionListRequest.dateTo = queryParams['dateTo'];
    }

    // Update pagination from query params
    if (queryParams['page']) {
      this.currentPage = +queryParams['page'];
      this.submissionListRequest.paging.pageNumber = this.currentPage;
    }

    if (queryParams['pageSize']) {
      this.pageSize = +queryParams['pageSize'];
      this.submissionListRequest.paging.pageSize = this.pageSize;
    }

    // Update sorting from query params
    if (queryParams['sortBy']) {
      this.sortBy = +queryParams['sortBy'] as any;
      this.submissionListRequest.sorting.field = this.sortBy;
    }

    if (queryParams['sortDirection']) {
      this.sortDirection = queryParams['sortDirection'] as 'asc' | 'desc';
      this.submissionListRequest.sorting.sortOrder = this.sortDirection === 'asc' ? 1 : 2;
    }

    // Update view mode from query params
    if (queryParams['viewMode'] && ['card', 'table'].includes(queryParams['viewMode'])) {
      this.viewMode = queryParams['viewMode'] as 'card' | 'table';
    }
  }

  private updateUrlQueryParams(): void {
    if (this.initialLoad) {
      this.initialLoad = false;
      return; // Don't update URL on initial load
    }

    const queryParams: any = {};
    const formValues = this.filterForm.value;

    // Add form values to query params if they have values
    if (formValues.search?.trim()) {
      queryParams.search = formValues.search.trim();
    }

    if (formValues.status) {
      queryParams.status = formValues.status;
    }

    if (formValues.category?.length > 0) {
      queryParams.category = formValues.category;
    }

    if (formValues.subcategory?.length > 0) {
      queryParams.subcategory = formValues.subcategory;
    }

    if (formValues.dateFrom?.trim()) {
      queryParams.dateFrom = formValues.dateFrom.trim();
    }

    if (formValues.dateTo?.trim()) {
      queryParams.dateTo = formValues.dateTo.trim();
    }

    // Add pagination params if not default values
    if (this.currentPage !== 1) {
      queryParams.page = this.currentPage;
    }

    if (this.pageSize !== 10) {
      queryParams.pageSize = this.pageSize;
    }

    // Add sorting params if not default values
    if (this.sortBy !== 1) {
      queryParams.sortBy = this.sortBy;
    }

    if (this.sortDirection !== 'desc') {
      queryParams.sortDirection = this.sortDirection;
    }

    // Add view mode if not default
    if (this.viewMode !== 'card') {
      queryParams.viewMode = this.viewMode;
    }

    // Update URL without triggering navigation
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: queryParams,
      queryParamsHandling: 'replace',
      replaceUrl: true
    });
  }

  loadStatuses(): void {
    this._rfqService
      .getRfqStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => {
          this.statusOptions = statuses;
        },
        error: () => {
          this.errorMessage = this._translate.instant('VENDOR.LOAD_STATUSES');
        },
      });
  }

  loadCategories(): void {
    this._rfqService
      .getRfqSCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          if (this.currentUser?.type == 'Vendor') {
            if (this.currentUser?.categories) {
              this.categoryOptions = categories.filter(category => 
                this.currentUser!.categories.some(userCategory => 
                  userCategory.id === category.id
                )
              );
            } else {
              this.categoryOptions = [];
            }
          } else {
            this.categoryOptions = categories;
          }

          this.updateSubcategoriesFromSelected();
        },
        error: () => {
          this.errorMessage = this._translate.instant('VENDOR.LOAD_CATEGORIES');
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
    this.filterForm = this._fb.group({
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
        this.updateUrlQueryParams();
        this.applyFilters();
      });

  // Other filters without debounce
  this.filterForm
    .get('status')
    ?.valueChanges.pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if (data) {
        this.currentPage = 1;
        this.updateUrlQueryParams();
        this.applyFilters();
      }
    });

    this.filterForm
      .get('category')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.updateUrlQueryParams();
      });

    this.filterForm
      .get('subcategory')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.updateUrlQueryParams();
      });

    this.filterForm
      .get('dateFrom')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.currentPage = 1;
          this.updateUrlQueryParams();
          this.applyFilters();
        }
      });

    this.filterForm
      .get('dateTo')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.currentPage = 1;
          this.updateUrlQueryParams();
          this.applyFilters();
        }
      });
  }

  loadRfqs(): void {
    this.errorMessage = '';
    this._rfqService
      .getAllRfqs(this.submissionListRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TableResponse<Rfq>) => {
          this.rfqs = Array.isArray(response.items)
            ? response.items
            : response.items
            ? [response.items]
            : [];
          this.filteredRfqs = Array.isArray(response.items)
            ? response.items
            : response.items
            ? [response.items]
            : [];
          this.totalItems = response.totalCount!;
          this.totalPages = response.totalPages!;
          this.initializeCarouselStates();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
  }

  loadStatistics(): void {
    this._rfqService
      .getRfqStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: () => {
          this.errorMessage = this._translate.instant('VENDOR.LOAD_STATISTICS');
        },
      });
  }

selectStatisticsFilter(status: string) {
  let findStatus;
  let dateFrom;
  let dateTo;
  
  this.submissionListRequest.status = [];
  this.submissionListRequest.dateFrom = undefined;
  this.submissionListRequest.dateTo = undefined;

  let statusList = [];
  if (
    status === 'Pending Review' ||
    status === 'Approved' ||
    status === 'Rejected' ||
    status === 'reviewed'
  ) {
    findStatus = this.statusOptions.find(el => el.name == status);
    statusList.push(findStatus?.id)
  } else if (status == 'last') {
    dateTo = new Date();
    dateFrom = new Date();
    dateFrom.setHours(dateFrom.getHours() - 24);
  } 
  
  if (status == 'Reviewed'){
    let findApprovedStatus = this.statusOptions.find(el => el.name == 'Approved');
    let findRejectedStatus = this.statusOptions.find(el => el.name == 'Rejected');
    this.filterForm.get('status')?.setValue(null);
    let areFiltersEmpty = this.highlightTotalRfqs();
    if (areFiltersEmpty) {
      this.submissionListRequest.status = [findApprovedStatus!.id, findRejectedStatus!.id];
      this.applyFilters();
    }
  } 
  this.filterForm.setValue({
    search: '',
    status: status != 'Reviewed' && findStatus ? findStatus.id : null,
    category: [],
    subcategory: [],
    dateFrom: dateFrom ? dateFrom.toISOString().slice(0, 10) : '',
    dateTo: dateTo ? dateTo.toISOString().slice(0, 10) : '',
  });

  this.updateUrlQueryParams();

  this.currentPage = 1;
  this.isLoading = true;
}

highlightTotalRfqs() {
  return  !this.filterForm.get('search')?.value && 
          !this.filterForm.get('status')?.value && 
          !this.filterForm.get('dateFrom')?.value && 
          !this.filterForm.get('dateTo')?.value && 
          (!this.filterForm.get('category')?.value || this.filterForm.get('category')?.value.length < 1) && 
          (!this.filterForm.get('subcategory')?.value || this.filterForm.get('subcategory')?.value.length < 1) &&
          (!this.submissionListRequest.status || this.submissionListRequest.status.length < 1)
}

highlightReviewedRfqs() {
  return !this.filterForm.get('status')?.value && this.submissionListRequest.status && this.submissionListRequest.status.length == 2;
}

highlightStatusRfqs(status: string) {
  let findStatus = this.statusOptions.find(el => el.name == status);
  return this.filterForm.get('status')?.value == findStatus?.id;
}

highlightLastRfqs(): boolean {
  const dateFrom = this.filterForm.get('dateFrom')?.value;
  const dateTo = this.filterForm.get('dateTo')?.value;

  if (!dateFrom || !dateTo) {
    return false;
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const now = new Date();
  const last24h = new Date();
  last24h.setHours(last24h.getHours() - 24);
  return from.toISOString().slice(0, 10) >= last24h.toISOString().slice(0, 10) && to.toISOString().slice(0, 10) <= now.toISOString().slice(0, 10);
}

  applyFilters(): void {
    this.submissionListRequest.query =
      this.filterForm.get('search')?.value.trim() || undefined;
    this.submissionListRequest.userId = this.userId!;
    const statusVal = this.filterForm.get('status')?.value;
    if (typeof statusVal === 'number') {
      this.submissionListRequest.status = [statusVal];
    }
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
    this.isLoading = true;
    this._rfqService
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
          this.initializeCarouselStates();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
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
    this._rfqService
      .updateRfqStatus(rfqId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRfq) => {
          this.isUpdating = false;
          this.successMessage = this._translate.instant(
            'VENDOR.STATUS_UPDATED'
          );
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
      this.errorMessage = this._translate.instant('ERROR.SESSION_EXPIRED');
      this._authService.logout();
    } else if (error.status === 403) {
      this.errorMessage = this._translate.instant('ERROR.NO_PERMISSION');
    } else if (error.status === 0) {
      this.errorMessage = this._translate.instant('ERROR.NO_CONNECTION');
    } else {
      this.errorMessage =
        error.error?.message || this._translate.instant('ERROR.LOAD_RFQS');
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyFilters();

      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    this.submissionListRequest = {
      status: [],
      paging: {
        pageNumber: 1,
        pageSize: 10,
      },
      sorting: {
        field: 1,
        sortOrder: 2,
      },
    };
    this.isLoading = true;

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {},
      queryParamsHandling: 'replace',
      replaceUrl: true
    });

    this.loadRfqs();
  }

  refreshData(): void {
    this.loadRfqs();
    this.loadStatistics();
  }

  getStatusColor(status: LookupValue): string {
    return this._rfqService.getStatusColor(status);
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

  getUserDisplayName(user: any): string {
    if (!user) return '';

    if (user.publicUsername) {
      return user.publicUsername;
    }

    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    return user.email;
  }

  getUserInitials(user: any): string {
    if (!user) return '';

    if (user.publicUsername) {
      const parts = user.publicUsername.trim().split(' ').filter((p: string)  => p.length > 0); // remove empty strings

      if (parts.length > 1) {
        const firstInitial = parts[0][0] || '';
        const secondInitial = parts[1][0] || '';
        return (firstInitial + secondInitial).toUpperCase();
      }

      const firstInitial = parts[0]?.[0] || '';
      return firstInitial.toUpperCase();
    }

    if (user.firstName || user.lastName) {
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    }

    return user.email?.charAt(0).toUpperCase() || '';
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
      this.flashInfo(
        this._translate.instant('VENDOR.PLEASE_SELECT_CATEGORIES')
      );
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
    this.applyFilters();
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
    this.applyFilters();
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
      return this._translate.instant('VENDOR.SELECT_CATEGORIES');
    }

    const selectedNames = this.categoryOptions
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name);

    return selectedNames.join(', ');
  }

  getSubcategoryDisplayText(): string {
    const selectedIds = this.filterForm.value.subcategory || [];
    if (selectedIds.length === 0) {
      return this._translate.instant('VENDOR.SELECT_SUBCATEGORIES');
    }

    const selectedNames = this.subcategoryOptions
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name);

    return selectedNames.join(', ');
  }

  canSendQuote(rfq: Rfq): boolean {
    if (!this.currentUser || this.currentUser.type !== UserRole.VENDOR) {
      return false;
    }
    if (!rfq.quotes || rfq.quotes.length === 0) {
      return true;
    }
    const firstQuote = rfq.quotes[0];
    return !firstQuote.vendorId || firstQuote.vendorId !== this.currentUser.id;
  }

  hasSentQuote(rfq: Rfq): boolean {
    if (!this.currentUser || this.currentUser.type !== UserRole.VENDOR) {
      return false;
    }
    if (!rfq.quotes || rfq.quotes.length === 0) {
      return false;
    }
    const firstQuote = rfq.quotes[0];
    return (
      firstQuote.vendorId !== undefined &&
      firstQuote.vendorId !== null &&
      firstQuote.vendorId === this.currentUser.id
    );
  }

  openQuoteFormDialog(id: number, customerId: number, edit: boolean) {
    let width = '60%';

    if (this.breakpointObserver.isMatched(Breakpoints.Handset)) {
      width = '90%';
    }

    const dialogRef = this._dialog.open(QuoteFormDialog, {
      width,
      maxWidth: '90%',
      height: 'auto',
      panelClass: 'add-quote-dialog',
      autoFocus: false,
      data: {
        action: edit ? 'Edit' : 'Add',
        rfqId: id,
        customerId: customerId,
        vendorId: this.currentUser?.id,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadStatistics();
        setTimeout(() => {
          let findRfqIndex = this.filteredRfqs.findIndex(
            (rfq) => rfq.id === id
          );
          if (findRfqIndex > -1) {
            this.filteredRfqs[findRfqIndex].quotes.push({
              title: result.title,
              description: result.description,
              price: result.price,
              quoteValidityIntervalType: result.quoteValidityIntervalType,
              quoteValidityInterval: result.quoteValidityInterval,
              vendorId: this.currentUser?.id!,
              submissionId: id,
            });
          }
        });
      }
    });
  }

  canApprove(rfq: Rfq): boolean {
    if (
      rfq.status?.name === 'Pending Review' ||
      rfq.status?.name === 'Rejected' ||
      rfq.status?.name === 'Archived'
    ) {
      return this.currentUser?.type === UserRole.ADMIN;
    } else {
      return false;
    }
  }

  approveRfq(rfqId: number) {
    const confirmKey = 'ALERTS.CONFIRM_APPROVE_RFQ';

    this._alert.confirm(confirmKey).then((result) => {
      if (result.isConfirmed) {
        const approveRfq = 2;
        this._rfqService.rfqChangeStatus(rfqId, approveRfq).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.rfqs = [];
            this.filteredRfqs = [];
            this.isLoading = true;
            this.loadRfqs();
            this.loadStatistics();
            Swal.fire({
              icon: 'success',
              title: this._translate.instant('ALERTS.SUCCESS_TITLE'),
              text: this._translate.instant('ALERTS.RFQ_APPROVED'),
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: this._translate.instant('ALERTS.ERROR_TITLE'),
              text: this._translate.instant('ALERTS.RFQ_APPROVE_FAILED'),
            });
          },
        });
      }
    });
  }

  canDecline(rfq: Rfq): boolean {
    if (
      rfq.status?.name === 'Approved' ||
      rfq.status?.name === 'Pending Review'
    ) {
      return this.currentUser?.type === UserRole.ADMIN;
    } else {
      return false;
    }
  }

  declineRfq(rfqId: number) {
    const confirmKey = 'ALERTS.CONFIRM_REJECT_RFQ';

    this._alert.confirm(confirmKey).then((result) => {
      if (result.isConfirmed) {
        const declineRfq = 3;
        this._rfqService.rfqChangeStatus(rfqId, declineRfq).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadRfqs();
            Swal.fire({
              icon: 'success',
              title: this._translate.instant('ALERTS.SUCCESS_TITLE'),
              text: this._translate.instant('ALERTS.RFQ_DECLINED'),
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: this._translate.instant('ALERTS.ERROR_TITLE'),
              text: this._translate.instant('ALERTS.RFQ_DECLINE_FAILED'),
            });
          },
        });
      }
    });
  }
  // Expose Math to template
  Math = Math;

  toggleDescription(id: string, event: Event) {
    const desc = document.getElementById(id);
    const btn = event.target as HTMLButtonElement;
    if (!desc) return;

    if (desc.classList.contains('description-collapsed')) {
      desc.classList.remove('description-collapsed');
      desc.classList.add('description-expanded');
      btn.textContent = this._translate.instant('VENDOR.SHOW_LESS');
    } else {
      desc.classList.remove('description-expanded');
      desc.classList.add('description-collapsed');
      btn.textContent = this._translate.instant('VENDOR.SHOW_MORE');
    }
  }

  navigateToMessages(rfq: Rfq): void {
    this._router.navigate(['/messages'], {
      queryParams: { quoteId: rfq.id, customerId: rfq?.user?.id },
    });
  }

  initializeCarouselStates() {
    if (this.filteredRfqs) {
      this.filteredRfqs.forEach((rfq) => {
        this.updateScrollState('carousel' + rfq.id);
      });
    }
  }

  scrollLeft(id: string) {
    const carousel = document.getElementById(id);
    if (carousel) {
      carousel.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollState(id), 300);
    }
  }

  scrollRight(id: string) {
    const carousel = document.getElementById(id);
    if (carousel) {
      carousel.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => this.updateScrollState(id), 300);
    }
  }

  updateScrollState(id: string) {
    const carousel = document.getElementById(id);
    if (!carousel) return;

    const scrollLeft = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;

    const needsScroll = scrollWidth > clientWidth;

    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

    this.carouselScrollStates[id] = {
      canScrollLeft: canScrollLeft && needsScroll,
      canScrollRight: canScrollRight && needsScroll,
      needsScroll,
    };
  }

  onCarouselScroll(event: Event, id: string) {
    this.updateScrollState(id);
  }

  getScrollState(id: string) {
    return (
      this.carouselScrollStates[id] || {
        canScrollLeft: false,
        canScrollRight: false,
        needsScroll: false,
      }
    );
  }

  onViewDetails(id: number): void {
    if (this.currentUser?.type === 'Vendor') {
      this._rfqService.viewedRfq(id).pipe(take(1)).subscribe({
        next: () => this._router.navigate(['/vendor-rfqs', id]),
        error: (err) => {
          this.handleError(err);
          this._router.navigate(['/vendor-rfqs', id]);
        },
      });
    } else {
      this._router.navigate(['/vendor-rfqs', id]);
    }
  }

  getStatusCount(rfq: Rfq, statusName: string): number {
    if (!rfq?.statusHistoryCount) return 0;
    const entry = rfq.statusHistoryCount.find(
      (s: any) => s.status?.name === statusName
    );
    return entry ? entry.count : 0;
  }

  getVendorStatus(rfq: Rfq): string | null {
    if (!rfq?.statusHistory) return null;

    const hasEngaged = rfq.statusHistory.some((s: any) => s.status?.id === 4);
    const hasQuoted = rfq.statusHistory.some((s: any) => s.status?.id === 3);
    const hasViewed = rfq.statusHistory.some((s: any) => s.status?.id === 2);

    if (hasEngaged) return this._translate.instant('VENDOR.ENGAGED');
    if (hasQuoted) return this._translate.instant('VENDOR.QUOTE_SENT');
    if (hasViewed) return this._translate.instant('VENDOR.VIEWED');

    return null;
  }

  isEditable(rfq: Rfq): boolean {
    if (rfq.user?.id !== this.currentUser?.id && this.currentUser?.type !== 'Administrator') {
      return false;
    }
    return !rfq.statusHistoryCount?.some((s: any) => s.status?.id === 3 || s.status?.id === 4);
  }
}
