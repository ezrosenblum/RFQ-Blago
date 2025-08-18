import { Component, OnDestroy, OnInit } from '@angular/core';
import { RfqService } from '../../../services/rfq';
import { Subject, take, takeUntil } from 'rxjs';
import { QuoteItem, QuoteSearchRequest, QuoteSearchResponse, Rfq } from '../../../models/rfq.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { User } from '../../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { QuoteSendMessageDialog } from '../quote-send-message-dialog/quote-send-message-dialog';
import { TranslateService } from '@ngx-translate/core';
import { QuoteFormDialog } from '../vendor-rfqs/quote-form-dialog/quote-form-dialog';
import { AlertService } from '../../../services/alert.service';


@Component({
  selector: 'app-rfq-details',
  standalone: false,
  templateUrl: './rfq-details.html',
  styleUrl: './rfq-details.scss',
})
export class RfqDetails implements OnInit, OnDestroy {
  loading: boolean = false;
  rfq!: Rfq;
  private destroy$ = new Subject<void>();
  submissionListRequest: QuoteSearchRequest = {
    paging: {
      pageNumber: 1,
      pageSize: 10,
    },
    sorting: {
      field: 1,
      sortOrder: 2,
    },
  };
  quotes: QuoteItem[] = [];
  totalItems = 0;
  totalPages = 0;
  currentUser: User | null = null;
  errorMessage = '';
  loadingQuoteId: number | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _rfqService: RfqService,
    private _router: Router,
    private _authService: Auth,
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _alert: AlertService
  ) {}

  ngOnInit() {
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.getDetails(id);
        this.submissionListRequest.submissionId = id;
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
      },
    });
  }

  getDetails(id: number) {
    this._rfqService
      .getRfqDetails(id)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.rfq = result;
          this.loadQuotes();
        },
        error: (error) => {
          this.handleError(error);
        },
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
    return (
      map[unit.toLowerCase()] ||
      'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300'
    );
  }

  // User initials
  getInitials(firstName?: string, lastName?: string): string {
    return (
      (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '')
    ).toUpperCase();
  }

  sendQuoteFirstMessage(quote: QuoteItem) {
    if (quote.lastMessage) {
      this._router.navigate(['/messages'], {
        queryParams: {
          quoteId: quote.id,
          customerId: this.rfq?.user?.id,
          vendorId: quote?.vendorId,
        },
      });
    } else {
      const dialogRef = this._dialog.open(QuoteSendMessageDialog, {
        width: '500px',
        maxWidth: '500px',
        height: 'auto',
        panelClass: 'send-quote-message-dialog',
        autoFocus: false,
        data: {
          quote: quote,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          setTimeout(() => {
            this._router.navigate(['/messages'], {
              queryParams: {
                quoteId: quote.id,
                customerId: this.rfq?.user?.id,
                vendorId: quote?.vendorId,
              },
            });
          }, 1000);
        }
      });
    }
  }

  loadQuotes(): void {
    this._rfqService
      .getQuotes(this.submissionListRequest)
      .pipe(take(1))
      .subscribe({
        next: (response: QuoteSearchResponse) => {
          this.quotes = Array.isArray(response.items)
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

  get pendingCount(): number {
    return this.quotes.filter((q) => q.status?.name === 'Pending').length;
  }

  get acceptedCount(): number {
    return this.quotes.filter((q) => q.status?.name === 'Approved').length;
  }

  onChangeStatus(quote: QuoteItem, statusId: number) {
    const statusConfirmKeyMap: { [key: number]: string } = {
      1: 'ALERTS.CONFIRM_VALID',
      2: 'ALERTS.CONFIRM_APPROVE',
      3: 'ALERTS.CONFIRM_REJECT',
      4: 'ALERTS.CONFIRM_INVALID',
    };

    const confirmKey = statusConfirmKeyMap[statusId] || 'ALERTS.CONFIRM_ACTION';

    this._alert.confirm(confirmKey).then((result) => {
      if (result.isConfirmed) {
        this._rfqService.quoteChangeStatus(quote.id, statusId).subscribe({
          next: () => {
            this.loadQuotes();
          },
          error: (error) => {
            this.handleError(error);
          },
        });
      }
    });
  }

  getQuoteCardClasses(status: any) {
    if (!status) return { border: '', header: '' };

    const colors: any = {
      Accepted: {
        border: 'border-green-200 dark:border-green-700',
        header:
          'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 text-green-900 dark:text-green-200',
      },
      Rejected: {
        border: 'border-red-200 dark:border-red-700',
        header:
          'from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 text-red-900 dark:text-red-200',
      },
      Pending: {
        border: 'border-yellow-200 dark:border-yellow-700',
        header:
          'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-900 dark:text-yellow-200',
      },
      Invalid: {
        border: 'border-gray-400 dark:border-gray-600',
        header:
          'from-gray-300 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300',
      },
    };

    return colors[status.name] || { border: '', header: '' };
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

    const hasQuoted = rfq.statusHistory.some((s: any) => s.status?.id === 3);
    const hasEngaged = rfq.statusHistory.some((s: any) => s.status?.id === 4);
    const hasViewed = rfq.statusHistory.some((s: any) => s.status?.id === 2);

    if (hasQuoted) return this._translate.instant('VENDOR.QUOTE_SENT');
    if (hasEngaged) return this._translate.instant('VENDOR.ENGAGED');
    if (hasViewed) return this._translate.instant('VENDOR.VIEWED');

    return null;
  }

  hasQuoted(rfq: Rfq): boolean {
    if (!rfq?.statusHistory) return false;
    return rfq.statusHistory.some((s: any) => s.status?.id === 3);
  }

  openQuoteFormDialog(id: number, customerId: number, edit: boolean) {
    const dialogRef = this._dialog.open(QuoteFormDialog, {
      width: '60%',
      maxWidth: '60%',
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
        this.getDetails(id);
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
      this.errorMessage =
        'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage =
        error.error?.message || 'An error occurred while loading RFQs.';
    }
  }
}
