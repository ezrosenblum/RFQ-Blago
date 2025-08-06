export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  status: LookupValue;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  dateCreated?: Date;
  picture?: string;
  suspensionReason?: string;
  companyDetails?: {
    id: number;
    name: string;
    contactPersonFirstName: string;
    contactPersonLastName: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    description: string;
    streetAddress: string;
    latitudeAddress?: number;
    longitudeAddress?: number;
    operatingRadius?: number;
    companySize?: {
      id: number;
      name: string;
    };
    certificateUrl?: string;
  };
}

export interface LookupValue {
  id: number;
  name: string;
}
export enum UserRole {
  VENDOR = 'Vendor',
  CLIENT = 'Customer',
}

export type FileType = 'avatar' | 'certificate';
