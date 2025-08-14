import { Component, OnInit } from '@angular/core';
import {
  FilterOptions,
  MyQuotesList,
  MyQuotesRequest,
  Quote,
} from '../../../models/my-quotes';
import { QuoteService } from '../../../services/my-quotes';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupValue } from '../../../models/rfq.model';
import { RfqService } from '../../../services/rfq';

@Component({
  standalone: false,
  selector: 'app-my-quotes',
  templateUrl: './my-quotes.html',
  styleUrl: './my-quotes.scss',
})
export class MyQuotesComponent implements OnInit {
  quotes: Quote[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  pendingCount = 0;
  approvedCount = 0;
  avgPrice = 0;
  currencyCode = 'USD';
  loading = false;

  filtersForm: FormGroup;

  sortField = 1;
  sortOrder = 1;

  viewMode: 'list' | 'grid' | 'table' = 'list';
  showFilters = false;

  constructor(
    private fb: FormBuilder,
    private quoteService: QuoteService,
    private route: ActivatedRoute,
    private router: Router,
    private rfqService: RfqService
  ) {
    this.filtersForm = this.fb.group({
      query: [''],
      priceFrom: [null],
      priceTo: [null],
      location: [''],
      minRating: [0],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.loadFiltersFromParams(params);
      this.searchQuotes();
    });
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  loadFiltersFromParams(params: any) {
    this.filtersForm.patchValue({
      query: params.query || '',
      priceFrom: params.priceFrom ? +params.priceFrom : null,
      priceTo: params.priceTo ? +params.priceTo : null,
      minRating: params.minRating ? +params.minRating : 0,
    });

    this.currentPage = params.page ? +params.page : 1;
    this.pageSize = params.size ? +params.size : 10;
    this.sortField = params.sortField ? +params.sortField : 1;
    this.sortOrder = params.sortOrder ? +params.sortOrder : 1;
    this.viewMode = params.view || 'list';
  }

  searchQuotes() {
    this.loading = true;

    const formValues = this.filtersForm.value;

    const request: MyQuotesRequest = {
      query: formValues.query || undefined,
      priceFrom: formValues.priceFrom ?? undefined,
      priceTo: formValues.priceTo ?? undefined,
      paging: { pageNumber: this.currentPage, pageSize: this.pageSize },
      sorting: { field: this.sortField, sortOrder: this.sortOrder },
    };

    this.quoteService
      .getMyQuotes(request)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          const raw = response?.quotes ?? response?.items ?? [];
          this.quotes = raw.map((q: any) => ({
            id: q.id ?? q.submission?.id,
            vendorName: q.submission.title,
            vendorNumber: q.vendor.phoneNumber,
            title: q.title ?? '',
            description: q.description ?? q.submission?.description ?? '',
            price: q.price ?? 0,
            currency: q.currency ?? 'USD',
            location: q.location ?? q.streetAddress ?? q.jobLocation ?? '',
            profileImage: q.profileImage ?? q.user?.picture ?? null,
            rating: q.rating ?? 0,
            successRate: q.successRate ?? 0,
            skills: q.skills ?? [],
            status: q.submission.status.name,
            statusId: q.submission.status.id,
            submissionDate: q.submission.submissionDate,
            warantyDuration: q.submission.warantyDuration,
          }));
          this.pendingCount = this.quotes.filter(
            (q) => q.statusId === 1
          ).length;
          this.approvedCount = this.quotes.filter(
            (q) => q.statusId === 2
          ).length;
          const avg = (arr: { price: number }[]) => {
            const sum = arr.reduce((s, it) => s + (Number(it.price) || 0), 0);
            return arr.length ? sum / arr.length : 0;
          };
          this.avgPrice = avg(this.quotes);
          const count =
            response.totalCount ??
            response.total ??
            response.pagination?.totalCount ??
            raw.length;
          const pages =
            response.totalPages ??
            response.pagination?.totalPages ??
            Math.ceil(count / this.pageSize);
          this.totalCount = count;
          this.totalPages = pages;
        },
        error: (err) => {
          console.error('Error fetching quotes:', err);
        },
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.updateUrlParams();
    this.searchQuotes();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updateUrlParams();
    this.searchQuotes();
  }

  onSortChange(field: number, order: number) {
    this.sortField = field;
    this.sortOrder = order;
    this.updateUrlParams();
    this.searchQuotes();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  toggleView(mode: 'list' | 'grid' | 'table') {
    this.viewMode = mode;
    this.updateUrlParams();
  }

  clearFilters() {
    this.filtersForm.reset({
      query: '',
      priceFrom: null,
      priceTo: null,
      location: '',
      minRating: 0,
    });
    this.onSearch();
  }

  statusStyles: Record<number, string> = {
    1: 'bg-yellow-100 text-yellow-800 border border-yellow-400',
    2: 'bg-green-100 text-green-800 border border-green-500',
    3: 'bg-red-100 text-red-800 border border-red-500',
    4: 'bg-gray-100 text-gray-800 border border-gray-400',
    5: 'bg-blue-100 text-blue-800 border border-blue-500',
  };

  getStatusClass(statusId: number): string {
    return this.statusStyles[statusId] || 'bg-gray-100 text-gray-800';
  }

  private updateUrlParams() {
    const queryParams: any = {};
    const formValues = this.filtersForm.value;

    if (formValues.query) queryParams.query = formValues.query;
    if (formValues.priceFrom) queryParams.priceFrom = formValues.priceFrom;
    if (formValues.priceTo) queryParams.priceTo = formValues.priceTo;
    if (formValues.location) queryParams.location = formValues.location;
    if (formValues.minRating) queryParams.minRating = formValues.minRating;
    if (this.currentPage > 1) queryParams.page = this.currentPage;
    if (this.pageSize !== 10) queryParams.size = this.pageSize;
    if (this.sortField !== 1) queryParams.sortField = this.sortField;
    if (this.sortOrder !== 1) queryParams.sortOrder = this.sortOrder;
    if (this.viewMode !== 'list') queryParams.view = this.viewMode;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace',
    });
  }

  getPaginationPages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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

  getStatusColor(status: LookupValue): string {
    return this.rfqService.getStatusColor(status);
  }

  formatCompactCurrency(value: number, currency = this.currencyCode): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value || 0);
    } catch {
      // Fallback if currency code is invalid
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value || 0);
    }
  }
}
