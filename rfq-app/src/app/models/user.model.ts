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
}

export interface LookupValue {
  id: string;
  name: string;
}
export enum UserRole {
  VENDOR = 'Vendor',
  CLIENT = 'Customer'
}
