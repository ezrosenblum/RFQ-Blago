import { User } from "./user.model";

export interface RfqRequest {
  title: string;
  description: string;
  quantity: number;
  unit: number;
  jobLocation: string;
  streetAddress: string;
  latitudeAddress: number;
  longitudeAddress: number;
  categoriesIds: number[];
  subcategoriesIds: number[];
  files: File[];
}

export interface LookupValue {
  id: number;
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
  category?: number;
  subcategory?: number;
  dateFrom?: Date;
  dateTo?: Date;
  paging: Paging;
  sorting: Sorting;
}

export interface QuoteSearchRequest {
  query?: string;
  vendorId?: number;
  submissionId?: number;
  submissionUserId?: number;
  priceFrom?: number;
  priceTo?: number;
  validFrom?: string;
  validTo?: string;
  paging?: Paging;
  sorting?: Sorting;
}

export interface Paging {
  pageNumber: number;
  pageSize: number;
}

export interface Sorting {
  field: number;
  sortOrder: number;
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
  categories?: Category[];
  subcategories?: Subcategory[];
  media: Media;
  quotes: QuoteRequest[];
  title?: string;
  statusHistory: StatusHistory[];
  vendorStatus: LookupValue;
  statusHistoryCount: StatusHistoryCount[];
  quotesAveragePrice: number;
  isValid: boolean;
  streetAddress: string;
  latitudeAddress: number;
  longitudeAddress: number
}

export interface StatusHistoryCount {
  count: number;
  status: LookupValue
}

export interface StatusHistory {
  vendorId: number;
  dateCreated: string;
  status: LookupValue
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

export interface GoogleMapsApi {
  maps: {
    Map: new (element: HTMLElement, options: any) => any;
    Marker: new (options: any) => any;
    Circle: new (options: any) => any;
    places: {
      Autocomplete: new (input: HTMLInputElement, options: any) => any;
    };
    event: {
      clearInstanceListeners: (instance: any) => void;
      addListener: (instance: any, eventName: string, handler: Function) => any;
      removeListener: (listener: any) => void;
    };
  };
}

export interface Subcategory {
  id: number;
  name: string;
  note: string;
}

export interface Category {
  id: number;
  name: string;
  note: string;
  subcategories: Subcategory[];
}

export interface MediaItem {
  id: string;
  name: string;
  isMain: boolean;
  sortOrder: number;
  size: number;
  url: string;
  type: number;
  extension: string;
}

export interface Media {
  items: MediaItem[];
}

export interface QuoteRequest {
  title: string,
  description: string,
  price: number,
  quoteValidityIntervalType: number,
  quoteValidityInterval: number,
  submissionId: number,
  vendorId: number
}

export interface StatusHistoryItem {
  vendorId: number;
  dateCreated: string;
  status: LookupValue;
}

export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  receiveEmailNotifications: boolean;
  receivePushNotifications: boolean;
}

export interface Unit extends LookupValue {}

export interface SubmissionStatus extends LookupValue {}

export interface Submission {
  id: number;
  title: string;
  description: string;
  quantity: number;
  unit: Unit;
  status: SubmissionStatus;
  jobLocation: string;
  user: UserDetails;
  submissionDate: string;
  isValid: boolean;
  media: Media;
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
  phoneNumber: string | null;
  suspensionReason: string | null;
  dateCreated: string;
  status: VendorStatus;
  companyDetails: CompanyDetails;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  receiveEmailNotifications: boolean;
  receivePushNotifications: boolean;
}

export interface QuoteValidityIntervalType extends LookupValue {}

export interface QuoteItem {
  submission: Submission;
  lastMessage: string | null;
  id: number;
  title: string;
  description: string;
  price: number;
  quoteValidityIntervalType: QuoteValidityIntervalType;
  quoteValidityInterval: number;
  validUntil: string;
  submissionId: number;
  vendorId: number;
  vendor: Vendor;
  created: string;
  media: Media;
  status: LookupValue;
  timelineIntervalType?: LookupValue;
  minimumTimelineDuration?: number;
  maximumTimelineDuration?: number;
  warantyIntervalType?: LookupValue;
  warantyDuration?: number;
}

export interface QuoteSearchResponse {
  items: QuoteItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
