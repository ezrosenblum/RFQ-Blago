import { User } from "./user.model";

export interface RfqRequest {
  description: string;
  quantity: number;
  unit: number;
  jobLocation: string;
  attachments: File[];
}


export interface LookupValue {
  id: string;
  name: string;
}

export interface TableResponse<T> {
  pageNumber?: number,
  totalPages?: number,
  totalCount?: number,
  hasPreviousPage?: boolean,
  hasNextPage?: boolean,
  items?: T
}

export interface SubmissionTableRequest {
  query?: string;
  userId?: number;
  status?: number;
  unit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  paging: {
    pageNumber: number;
    pageSize: number;
  },
  sorting?: {
    field: number;
    sortOrder: number;
  };
}

export interface Rfq {
  id?: number;
  description?: string;
  quantity?: number;
  unit?: LookupValue;
  status?: LookupValue;
  jobLocation?: string;
  user?: User;
  submissionDate?: Date;
}

export interface RfqStatistics {
  submissionsCount: number;
  pendingSubmissionsCount: number;
  reviewedSubmissionsCount: number;
  acceptedSubmissionsCount: number;
  rejectedSubmissionsCount: number;
  last24HoursSubmissionsCount: number;
}

export enum UnitType {
  LF = 'LF', // Linear Feet
  SF = 'SF', // Square Feet
  EA = 'EA'  // Each
}

export enum RfqStatus {
  PENDING = 1,
  REVIEWED = 2,
  QUOTED = 3,
  REJECTED = 4
}

export interface FilePondFile {
  file: File;
  id: string;
  status: number;
  origin: 'input' | 'limbo' | 'local' | 'remote';
  [key: string]: string | number | boolean | File | undefined;
}