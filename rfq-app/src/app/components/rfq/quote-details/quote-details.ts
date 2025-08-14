import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../../services/rfq';
import { Subject, take, takeUntil } from 'rxjs';
import { QuoteItem } from '../../../models/rfq.model';
import { Auth } from '../../../services/auth';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-quote-details',
  standalone: false,
  templateUrl: './quote-details.html',
  styleUrl: './quote-details.scss',
})
export class QuoteDetails implements OnInit {
  private destroy$ = new Subject<void>();
  quote!: QuoteItem;
  currentUser: User | null = null;
  errorMessage = '';

  constructor(
    private _route: ActivatedRoute,
    private _rfqService: RfqService,
    private _router: Router,
    private _authService: Auth
  ) {}

  ngOnInit() {
    this._route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.getDetails(id);
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
      .getQuoteDetails(id)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.quote = result;
        },
        error: (err) => {
          console.error('Failed to load Quote details', err);
        },
      });
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0).toUpperCase() ?? '';
    const last = lastName?.charAt(0).toUpperCase() ?? '';
    return first + last || '?';
  }

  navigateToMessages(): void {
    this._router.navigate(['/messages']);
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
