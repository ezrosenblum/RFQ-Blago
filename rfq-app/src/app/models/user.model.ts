export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
}

export enum UserRole {
  VENDOR = 'Vendor',
  CLIENT = 'Customer'
}
