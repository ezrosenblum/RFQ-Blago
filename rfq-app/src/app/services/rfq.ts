// src/app/services/rfq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LookupValue, Rfq, RfqRequest, RfqStatistics, RfqStatus, SubmissionTableRequest, TableResponse, UnitType } from '../models/rfq.model';
import { Auth } from './auth';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class RfqService {
  private readonly API_URL = environment.apiUrl;
  private readonly DEMO_MODE = true; // Set to false when connecting to real API

  // Demo RFQ database
  private demoRfqs: Rfq[] = [
  ];

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  createRfq(rfqData: RfqRequest): Observable<boolean | null> {
    return this.http.post<boolean>(`${this.API_URL}Submission`, rfqData)
      .pipe(
        map(response => {
          return true
        })
      );
  }

  getAllRfqs(request: SubmissionTableRequest): Observable<TableResponse<Rfq>> {
    return this.http.post<TableResponse<Rfq>>(`${this.API_URL}Submission/search`, request);
  }

  getRfqById(id: number): Observable<Rfq> {
    if (this.DEMO_MODE) {
      return this.demoGetRfqById(id);
    }

    return this.http.get<ApiResponse<Rfq>>(`${this.API_URL}/rfq/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'RFQ not found');
        })
      );
  }

  getRfqUnits(): Observable<LookupValue[]> {
    return this.http.get<LookupValue[]>(`${this.API_URL}Submission/units`)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getRfqStatuses(): Observable<LookupValue[]> {
    return this.http.get<LookupValue[]>(`${this.API_URL}Submission/statuses`)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  private demoGetRfqById(id: number): Observable<Rfq> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const rfq = this.demoRfqs.find(r => r.id === id);
        if (!rfq) {
          throw new Error('RFQ not found');
        }
        return rfq;
      })
    );
  }

  updateRfqStatus(id: number, status: number): Observable<boolean> {
    return this.http.put<ApiResponse<Rfq>>(`${this.API_URL}Submission/status/${id}?status=${status}`, null)
      .pipe(
        map(response => {
          return true;
        })
      );
  }

  deleteRfq(id: number): Observable<void> {
    if (this.DEMO_MODE) {
      return this.demoDeleteRfq(id);
    }

    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/rfq/${id}`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete RFQ');
          }
        })
      );
  }

  private demoDeleteRfq(id: number): Observable<void> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const rfqIndex = this.demoRfqs.findIndex(r => r.id === id);
        if (rfqIndex === -1) {
          throw new Error('RFQ not found');
        }

        this.demoRfqs.splice(rfqIndex, 1);
      })
    );
  }

  // Get statistics about RFQs
  getRfqStatistics(): Observable<RfqStatistics> {
    return this.http.get<RfqStatistics>(`${this.API_URL}Submission/count/report`)
      .pipe(
        map(response => {
          if (response) {
            return response;
          }
          throw new Error('Failed to get statistics');
        })
      );
  }

  // Utility methods
  getStatusDisplayName(status: RfqStatus): string {
    const statusNames: { [key in RfqStatus]: string } = {
      [RfqStatus.PENDING]: 'Pending Review',
      [RfqStatus.REVIEWED]: 'Under Review',
      [RfqStatus.QUOTED]: 'Quoted',
      [RfqStatus.REJECTED]: 'Rejected'
    };
    return statusNames[status];
  }

getStatusColor(status: LookupValue): string {
  const statusColors: { [key: string]: string } = {
    1: 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/20',
    2: 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/20',
    3: 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/20',
    4: 'text-error-600 bg-error-100 dark:text-error-400 dark:bg-error-900/20'
  };

  return statusColors[status.id] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
}

  getUnitDisplayName(unit: UnitType): string {
    const unitNames: { [key in UnitType]: string } = {
      [UnitType.LF]: 'Linear Feet',
      [UnitType.SF]: 'Square Feet',
      [UnitType.EA]: 'Each'
    };
    return unitNames[unit];
  }

  // Method to get demo RFQs for testing (demo mode only)
  getDemoRfqs(): Rfq[] {
    return this.DEMO_MODE ? [...this.demoRfqs] : [];
  }

  // Method to switch between demo and real API mode
  setDemoMode(enabled: boolean): void {
    console.log(`RFQ Service demo mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}
