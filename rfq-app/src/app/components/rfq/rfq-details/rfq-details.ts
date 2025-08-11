import { Component, OnDestroy, OnInit } from '@angular/core';
import { RfqService } from '../../../services/rfq';
import { Subject, take, takeUntil } from 'rxjs';
import { LookupValue, Rfq } from '../../../models/rfq.model';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-rfq-details',
  standalone: false,
  templateUrl: './rfq-details.html',
  styleUrl: './rfq-details.scss'
})
export class RfqDetails implements OnInit, OnDestroy{

  rfq!: Rfq;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rfqService: RfqService
  ) {
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (id) {
          this.getDetails(id);
        }
      });
  }

  getDetails(id: number) {
    this.rfqService.getRfqDetails(id).pipe(take(1)).subscribe({
      next: (result) => {
        this.rfq = result
      },
      error: (err) => {
        console.error('Failed to load RFQ details', err);
      }
    });
  }

  // Status badge color based on status name/id
  getStatusColor(status?: LookupValue): string {
    if (!status) {
      return 'bg-secondary-100 text-secondary-800 dark:bg-dark-700 dark:text-secondary-300';
    }

    switch (status.name.toLowerCase()) {
      case 'pending':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300';
      case 'under review':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
      case 'accepted':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300';
      case 'rejected':
        return 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
