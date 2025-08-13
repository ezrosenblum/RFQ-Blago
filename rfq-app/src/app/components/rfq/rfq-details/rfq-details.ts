import { Component, OnDestroy, OnInit } from '@angular/core';
import { RfqService } from '../../../services/rfq';
import { Subject, take, takeUntil } from 'rxjs';
import { QuoteItem, QuoteSearchRequest, QuoteSearchResponse, Rfq } from '../../../models/rfq.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { User } from '../../../models/user.model';


@Component({
  selector: 'app-rfq-details',
  standalone: false,
  templateUrl: './rfq-details.html',
  styleUrl: './rfq-details.scss'
})
export class RfqDetails implements OnInit, OnDestroy{

  loading: boolean = false
  rfq!: Rfq;
  private destroy$ = new Subject<void>();
  submissionListRequest: QuoteSearchRequest = {
      paging: {
        pageNumber: 1,
        pageSize: 10
      },
      sorting: {
        field: 1,
        sortOrder: 2
      }
    };
  quotes: QuoteItem[] = [];
  totalItems = 0;
  totalPages = 0;
  currentUser: User | null = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private rfqService: RfqService,
    private router: Router,
    private _authService: Auth
  ) {
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (id) {
          this.getDetails(id);
          this.submissionListRequest.submissionId = id
        }
      });

      this._authService.currentUserSubject.subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
          }
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  getDetails(id: number) {
    this.rfqService.getRfqDetails(id).pipe(take(1)).subscribe({
      next: (result) => {
        this.rfq = result
        this.loadQuotes();
      },
      error: (err) => {
        console.error('Failed to load RFQ details', err);
      }
    });
  }

  // Status badge color based on status name/id
  getStatusColor(status?: { id: number; name: string }): string {
    if (!status) {
      return 'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300';
    }

    switch (status.id) {
      case 1: // Pending Review
        return 'bg-yellow-100 text-yellow-800 border border-yellow-400';
      case 2: // Approved
        return 'bg-green-100 text-green-800 border border-green-500';
      case 3: // Rejected
        return 'bg-red-100 text-red-800 border border-red-500';
      case 4: // Archived
        return 'bg-gray-100 text-gray-800 border border-gray-400';
      case 5: // Completed
        return 'bg-blue-100 text-blue-800 border border-blue-500';
      default:
        return 'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300';
    }
  }

  // Unit badge color
  getUnitColor(unit?: string): string {
    if (!unit) {
      return 'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300';
    }
    const map: { [key: string]: string } = {
      ea: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      kg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      m: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return map[unit.toLowerCase()] || 'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300';
  }

  // User initials
  getInitials(firstName?: string, lastName?: string): string {
    return (
      (firstName?.charAt(0) || '') +
      (lastName?.charAt(0) || '')
    ).toUpperCase();
  }

  navigateToMessages(): void {
    this.router.navigate(['/messages'], {queryParams: { rfqId: this.rfq.id, customerId: this.rfq?.user?.id }});
  }

  loadQuotes(): void {
      this.rfqService.getQuotes(this.submissionListRequest)
        .pipe(take(1))
        .subscribe({
          next: (response: QuoteSearchResponse) => {
          this.quotes = Array.isArray(response.items) ? response.items : response.items ? [response.items] : [];
            this.totalItems = response.totalCount!;
            this.totalPages = response.totalPages!;
          },
          error: (error) => {

          }
        });
    }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      this._authService.logout();
    } else if (error.status === 403) {
      this.errorMessage = 'You do not have permission to view this content.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'An error occurred while loading RFQs.';
    }
  }
}
