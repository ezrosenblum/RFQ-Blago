import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { RfqService } from '../../../services/rfq';
import { QuoteItem } from '../../../models/rfq.model';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-approved-quote-details',
  standalone: false,
  templateUrl: './approved-quote-details.html',
  styleUrl: './approved-quote-details.scss'
})
export class ApprovedQuoteDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  quote!: QuoteItem;
  quoteId: number | null = null;
  errorMessage = '';
  
  constructor(
    private _route: ActivatedRoute,
    private _rfqService: RfqService,
    private _authService: Auth,
    private _router: Router,
  ){}

  ngOnInit(): void {
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.quoteId = id;
      }
    });

    this._authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if (data) {
        const allowedTypes = ['Customer'];
        if (!allowedTypes.includes(data.type)) {
          this._router.navigate(['/vendor-rfqs']);
        } else {
          if (this.quoteId) {
            this.getDetails(this.quoteId);
          }
        }
      }
    });
  }

  getDetails(id: number) {
    this._rfqService
      .getQuoteDetails(id)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.quote = result;
        },
        error: (error) => {
          this.handleError(error);
        },
      });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
