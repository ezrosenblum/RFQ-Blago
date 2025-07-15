export interface User {
  id: number;
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
