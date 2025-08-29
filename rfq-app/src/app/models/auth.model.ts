import { LookupValue, User, UserRole } from './user.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export class Token {
  constructor(public accessToken: string, public refreshToken: string) {}
}

export class PasswordResetRequest {
  constructor(
    public token: string,
    public uid: string,
    public password: string
  ) {}
}

export class VerifyData {
  token?: string | null | undefined;
  uid?: string | null | undefined;
}

export class ResendEmail {
  constructor(
    public email ?: string
  ){}
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  publicUsername: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  companyDetails?: CompanyDetails;
}

export interface CompanyDetails {
  name: string;
  businessAddress: string;
  longitude: number;
  latitude: number;
  operatingRadius: number;
  contactPersonFirstName: string;
  contactPersonLastName: string;
  contactEmail: string;
  contactPhone: string;
  businessDescription: string;
  companySize: number;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  phoneNumber: string;
  suspensionReason: string;
  dateCreated: string;
  status: LookupValue;
  companyDetails: CompanyDetails;
}
