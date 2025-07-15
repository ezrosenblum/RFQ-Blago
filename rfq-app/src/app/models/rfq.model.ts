export interface RfqRequest {
  description: string;
  quantity: number;
  unit: UnitType;
  jobLocation: string;
}

export interface Rfq {
  id: string;
  description: string;
  quantity: number;
  unit: UnitType;
  jobLocation: string;
  status: RfqStatus;
  submittedBy: string;
  submittedByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UnitType {
  LF = 'LF', // Linear Feet
  SF = 'SF', // Square Feet
  EA = 'EA'  // Each
}

export enum RfqStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  QUOTED = 'quoted',
  REJECTED = 'rejected'
}
