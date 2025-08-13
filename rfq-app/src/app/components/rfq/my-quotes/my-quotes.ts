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
    private router: Router
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
          }));
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
}
