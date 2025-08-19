import { Paging, Sorting } from './notifications.model';
import { LookupValue } from './user.model';

export interface SubmissionUnit extends LookupValue {}
export interface SubmissionStatus extends LookupValue {}

export interface SubmissionUser {
  id: number;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface Submission {
  id: number;
  title: string;
  description: string;
  quantity: number;
  unit: SubmissionUnit;
  status: SubmissionStatus;
  jobLocation: string;
  user: SubmissionUser;
  submissionDate: Date;
  isValid: boolean;
  streetAddress: string;
  latitudeAddress: number;
  longitudeAddress: number;
}

export interface CompanySize extends LookupValue {}

export interface CompanyDetails {
  id: number;
  name: string;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  description: string;
  streetAddress: string;
  latitudeAddress: number;
  longitudeAddress: number;
  operatingRadius: number;
  companySize: CompanySize;
  certificateUrl: string | null;
}

export interface VendorStatus extends LookupValue {}

export interface Vendor {
  id: number;
  firstName: string;
  lastName: string;
  picture: string;
  phoneNumber: string;
  suspensionReason: string | null;
  email: string;
  receiveEmailNotifications: boolean;
  receivePushNotifications: boolean;
  dateCreated: Date;
  status: VendorStatus;
  companyDetails: CompanyDetails;
}

export interface QuoteMessageStatus extends LookupValue {}

export interface QuoteMessageSender {
  id: number;
  firstName: string;
  lastName: string;
  picture: string;
}


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
  submission: Submission;
  id: number;
  title: string;
  description: string;
  price: number;
  status: LookupValue;
  quoteValidityIntervalType: LookupValue;
  quoteValidityInterval: number;
  validUntil: string;
  submissionId: number;
  vendorId: number;
  vendor: Vendor;
  created: Date;
  timelineIntervalType: LookupValue;
  minimumTimelineDuration: number;
  maximumTimelineDuration: number;
  warantyIntervalType: LookupValue;
  warrantyDuration: number;
  lastMessage: string | null;
}

export interface QuotesResponse {
  items: Quote[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface MyQuotesList {
  items: Quote[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pageSize?: number;
}
export interface FilterOptions {
  query: string;
  priceFrom: number | null;
  priceTo: number | null;
  location?: string;
  minRating?: number;
}
