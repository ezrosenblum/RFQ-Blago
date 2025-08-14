import { Paging, Sorting } from './notifications.model';

export interface MyQuotesRequest {
  query?: string;
  vendorId?: number;
  submissionId?: number;
  submissionUserId?: number;
  priceFrom?: number | null;
  priceTo?: number | null;
  validFrom?: string;
  validTo?: string;
  paging: Paging;
  sorting: Sorting;
}

export interface Quote {
  id: number;
  vendorName: string;
  vendorNumber: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  successRate: number;
  location: string;
  validFrom: string;
  validTo: string;
  skills: string[];
  profileImage?: string;
  status: string;
  statusId: number;
  submissionDate?: Date;
  warantyDuration?: number;
}

export interface MyQuotesList {
  quotes: Quote[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  query: string;
  priceFrom: number | null;
  priceTo: number | null;
  location: string;
  minRating: number;
}
