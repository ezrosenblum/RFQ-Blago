import { User, UserRole } from "./user.model";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
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
    constructor(
        public accessToken: string,
        public refreshToken: string
    ) { }
}