// src/app/services/rfq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { Rfq, RfqRequest, RfqStatus, UnitType } from '../models/rfq.model';
import { Auth } from './auth';
import { ApiResponse, PaginatedResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class RfqService {
  private readonly API_URL = environment.apiUrl;
  private readonly DEMO_MODE = true; // Set to false when connecting to real API

  // Demo RFQ database
  private demoRfqs: Rfq[] = [
    {
      id: 'rfq-1',
      description: 'Install new kitchen cabinets in residential home. Premium hardwood finish required with soft-close hinges and full-extension drawers.',
      quantity: 25,
      unit: UnitType.EA,
      jobLocation: 'Seattle, WA - Downtown Condo',
      status: RfqStatus.PENDING,
      submittedBy: 'demo-client-1',
      submittedByEmail: 'client@demo.com',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: 'rfq-2',
      description: 'Flooring installation for office space. Commercial grade vinyl plank flooring with moisture barrier in high-traffic area.',
      quantity: 2500,
      unit: UnitType.SF,
      jobLocation: 'Portland, OR - Business District',
      status: RfqStatus.REVIEWED,
      submittedBy: 'demo-client-1',
      submittedByEmail: 'client@demo.com',
      createdAt: new Date('2024-01-14T14:15:00Z'),
      updatedAt: new Date('2024-01-14T16:20:00Z')
    },
    {
      id: 'rfq-3',
      description: 'Exterior painting for 3-story commercial building. Power washing, primer, and two coats of weather-resistant paint required.',
      quantity: 8500,
      unit: UnitType.SF,
      jobLocation: 'San Francisco, CA - SOMA District',
      status: RfqStatus.QUOTED,
      submittedBy: 'demo-client-2',
      submittedByEmail: 'client2@demo.com',
      createdAt: new Date('2024-01-12T09:00:00Z'),
      updatedAt: new Date('2024-01-13T11:45:00Z')
    },
    {
      id: 'rfq-4',
      description: 'Custom millwork for restaurant renovation. Solid oak trim and wainscoting with hand-rubbed finish to match existing decor.',
      quantity: 450,
      unit: UnitType.LF,
      jobLocation: 'Austin, TX - East Side',
      status: RfqStatus.PENDING,
      submittedBy: 'demo-client-2',
      submittedByEmail: 'client2@demo.com',
      createdAt: new Date('2024-01-16T08:45:00Z'),
      updatedAt: new Date('2024-01-16T08:45:00Z')
    },
    {
      id: 'rfq-5',
      description: 'HVAC system installation for new construction home. Central air with smart thermostat, ductwork, and 10-year warranty.',
      quantity: 1,
      unit: UnitType.EA,
      jobLocation: 'Denver, CO - Highlands Ranch',
      status: RfqStatus.REVIEWED,
      submittedBy: 'demo-client-1',
      submittedByEmail: 'client@demo.com',
      createdAt: new Date('2024-01-11T13:20:00Z'),
      updatedAt: new Date('2024-01-12T09:15:00Z')
    }
  ];

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  createRfq(rfqData: RfqRequest): Observable<Rfq> {
    if (this.DEMO_MODE) {
      return this.demoCreateRfq(rfqData);
    }

    return this.http.post<ApiResponse<Rfq>>(`${this.API_URL}/rfq`, rfqData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create RFQ');
        })
      );
  }

  private demoCreateRfq(rfqData: RfqRequest): Observable<Rfq> {
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        const currentUser = this.authService.getCurrentUser();

        // Create new RFQ
        const newRfq: Rfq = {
          id: `rfq-demo-${Date.now()}`,
          description: rfqData.description,
          quantity: rfqData.quantity,
          unit: rfqData.unit,
          jobLocation: rfqData.jobLocation,
          status: RfqStatus.PENDING,
          submittedBy: currentUser?.id || 'anonymous',
          submittedByEmail: currentUser?.email || 'anonymous@demo.com',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Add to demo database
        this.demoRfqs.unshift(newRfq);

        return newRfq;
      })
    );
  }

  getAllRfqs(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Rfq>> {
    if (this.DEMO_MODE) {
      return this.demoGetAllRfqs(page, limit);
    }

    return this.http.get<PaginatedResponse<Rfq>>(`${this.API_URL}/rfq?page=${page}&limit=${limit}`);
  }

  private demoGetAllRfqs(page: number, limit: number): Observable<PaginatedResponse<Rfq>> {
    return of(null).pipe(
      delay(800), // Simulate network delay
      map(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRfqs = this.demoRfqs.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedRfqs,
          pagination: {
            page: page,
            limit: limit,
            total: this.demoRfqs.length,
            totalPages: Math.ceil(this.demoRfqs.length / limit)
          }
        };
      })
    );
  }

  getRfqById(id: string): Observable<Rfq> {
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

  private demoGetRfqById(id: string): Observable<Rfq> {
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

  updateRfqStatus(id: string, status: RfqStatus): Observable<Rfq> {
    if (this.DEMO_MODE) {
      return this.demoUpdateRfqStatus(id, status);
    }

    return this.http.patch<ApiResponse<Rfq>>(`${this.API_URL}/rfq/${id}/status`, { status })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update RFQ status');
        })
      );
  }

  private demoUpdateRfqStatus(id: string, status: RfqStatus): Observable<Rfq> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const rfqIndex = this.demoRfqs.findIndex(r => r.id === id);
        if (rfqIndex === -1) {
          throw new Error('RFQ not found');
        }

        this.demoRfqs[rfqIndex] = {
          ...this.demoRfqs[rfqIndex],
          status,
          updatedAt: new Date()
        };

        return this.demoRfqs[rfqIndex];
      })
    );
  }

  deleteRfq(id: string): Observable<void> {
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

  private demoDeleteRfq(id: string): Observable<void> {
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

  // Get RFQs filtered by various criteria
  getFilteredRfqs(filters: {
    status?: RfqStatus;
    unit?: UnitType;
    submittedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
  }, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Rfq>> {

    if (this.DEMO_MODE) {
      return this.demoGetFilteredRfqs(filters, page, limit);
    }

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.status) params.append('status', filters.status);
    if (filters.unit) params.append('unit', filters.unit);
    if (filters.submittedBy) params.append('submittedBy', filters.submittedBy);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters.search) params.append('search', filters.search);

    return this.http.get<PaginatedResponse<Rfq>>(`${this.API_URL}/rfq/search?${params.toString()}`);
  }

  private demoGetFilteredRfqs(filters: any, page: number, limit: number): Observable<PaginatedResponse<Rfq>> {
    return of(null).pipe(
      delay(600),
      map(() => {
        let filteredRfqs = [...this.demoRfqs];

        // Apply filters
        if (filters.status) {
          filteredRfqs = filteredRfqs.filter(rfq => rfq.status === filters.status);
        }

        if (filters.unit) {
          filteredRfqs = filteredRfqs.filter(rfq => rfq.unit === filters.unit);
        }

        if (filters.submittedBy) {
          filteredRfqs = filteredRfqs.filter(rfq => rfq.submittedBy === filters.submittedBy);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredRfqs = filteredRfqs.filter(rfq =>
            rfq.description.toLowerCase().includes(searchTerm) ||
            rfq.jobLocation.toLowerCase().includes(searchTerm) ||
            rfq.submittedByEmail.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.dateFrom) {
          filteredRfqs = filteredRfqs.filter(rfq => rfq.createdAt >= filters.dateFrom);
        }

        if (filters.dateTo) {
          filteredRfqs = filteredRfqs.filter(rfq => rfq.createdAt <= filters.dateTo);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRfqs = filteredRfqs.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedRfqs,
          pagination: {
            page: page,
            limit: limit,
            total: filteredRfqs.length,
            totalPages: Math.ceil(filteredRfqs.length / limit)
          }
        };
      })
    );
  }

  // Get statistics about RFQs
  getRfqStatistics(): Observable<{
    total: number;
    pending: number;
    reviewed: number;
    quoted: number;
    rejected: number;
    recentCount: number;
  }> {
    if (this.DEMO_MODE) {
      return this.demoGetRfqStatistics();
    }

    return this.http.get<ApiResponse<any>>(`${this.API_URL}/rfq/statistics`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to get statistics');
        })
      );
  }

  private demoGetRfqStatistics(): Observable<any> {
    return of(null).pipe(
      delay(400),
      map(() => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return {
          total: this.demoRfqs.length,
          pending: this.demoRfqs.filter(rfq => rfq.status === RfqStatus.PENDING).length,
          reviewed: this.demoRfqs.filter(rfq => rfq.status === RfqStatus.REVIEWED).length,
          quoted: this.demoRfqs.filter(rfq => rfq.status === RfqStatus.QUOTED).length,
          rejected: this.demoRfqs.filter(rfq => rfq.status === RfqStatus.REJECTED).length,
          recentCount: this.demoRfqs.filter(rfq => rfq.createdAt >= oneDayAgo).length
        };
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

  getStatusColor(status: RfqStatus): string {
    const statusColors: { [key in RfqStatus]: string } = {
      [RfqStatus.PENDING]: 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/20',
      [RfqStatus.REVIEWED]: 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/20',
      [RfqStatus.QUOTED]: 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/20',
      [RfqStatus.REJECTED]: 'text-error-600 bg-error-100 dark:text-error-400 dark:bg-error-900/20'
    };
    return statusColors[status];
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
