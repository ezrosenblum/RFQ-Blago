export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  publicUsername?: string;
  phoneNumber?: string;
  profilePicture?: string;
  status: LookupValue;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  dateCreated?: Date;
  picture?: string;
  suspensionReason?: string;
  categories: LookupValue[];
  subcategories: LookupValue[];
  receiveEmailNotifications?: boolean;
  receivePushNotifications?: boolean;
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
    certificate?: {
      id: string;
      name: string;
      isMain: boolean;
      sortOrder: number;
      size: number;
      url: string;
      type: number;
      extension: string;
    };
  };
}

export interface userChat {
  name: string;
  email: string;
  id: number;
}

export interface LookupValue {
  id: number;
  name: string;
}
export enum UserRole {
  VENDOR = 'Vendor',
  CLIENT = 'Customer',
  ADMIN = 'Administrator'
}

export type FileType = 'avatar' | 'certificate';


export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface MessageConevrsationRequest {
  vendorId: number | null,
  submissionUserId: number | null,
  hasConversations: boolean,
  paging: {
    pageNumber: number,
    pageSize: number
  },
  sorting: {
    field: number,
    sortOrder: number
  }
}

export interface MessageConversationMessagesRequest {
  submissionQuoteId: number | null,
  paging: {
    pageNumber: number,
    pageSize: number
  },
  sorting: {
    field: 1,
    sortOrder: 1
  }
}

export interface MessageAdminConversationList {
    items: MessageAdminConversationEntry[],
    pageNumber: number,
    totalPages: number,
    totalCount: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean
}

export interface MessageAdminConversationEntry {
  submission: {
    id: number;
    title: string;
    description: string;
    quantity: number;
    unit: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    jobLocation: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      picture: string;
      receiveEmailNotifications: boolean;
      receivePushNotifications: boolean;
      publicUsername: string;
    };
    submissionDate: string;
    isValid: boolean;
    media: {
      items: any[];
    };
    streetAddress: string;
    latitudeAddress: number;
    longitudeAddress: number;
  };
  id: number;
  title: string;
  description: string;
  price: number;
  quoteValidityIntervalType: {
    id: number;
    name: string;
  };
  quoteValidityInterval: number;
  validUntil: string;
  submissionId: number;
  vendorId: number;
  vendor: {
    phoneNumber: string | null;
    suspensionReason: string | null;
    dateCreated: string;
    status: {
      id: number;
      name: string;
    };
    companyDetails: any | null;
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    picture: string | null;
    receiveEmailNotifications: boolean;
    receivePushNotifications: boolean;
    publicUsername: string | null;
  };
  created: string;
  media: {
    items: any[];
  };
  lastMessage: {
    content: string;
    created: string;
    id: number;
    quoteMessageStatus: {
      id: number,
      name: string,
    };
    senderId: number;
    submissionQuoteId: number;
    sender: {
      firstName: string;
      id: number,
      lastName: string;
      picture: string;
    }
  }
}