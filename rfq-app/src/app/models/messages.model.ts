export interface Conversation {
  id: number;
  company: string;
  initials: string;
  project: string;
  lastMessage: string;
  time: string;
  bgColor: string;
  hasIndicator?: boolean;
}

export interface Message {
  sender: string;
  content: string;
  time: string;
  isUser: boolean;
  initials: string;
  bgColor: string;
  hasPreview?: boolean;
  preview?: {
    title: string;
    description: string;
    platform: string;
  };
}

export interface Activity {
  icon: string;
  title: string;
  subtitle?: string;
  date?: string;
  bgColor: string;
}

export interface CreateMessage {
  SubmissionQuoteId: number;
  Content: string;
  Files?: File[];
}

export interface MessageEntry {
    id: number,
    content: string,
    submissionQuoteId: number | null,
    senderId: number,
    created: string | Date,
    quoteMessageStatus: {
      id: number,
      name: string
    },
    media: {
      items: MessageMediaEntry[]
    },
    sender: {
      id: number,
      firstName: string,
      lastName: string,
      email: string | null,
      picture: string | null,
      receiveEmailNotifications: boolean,
      receivePushNotifications: boolean
    }
}

export interface MessageMediaEntry {
  id: string;
  name: string;
  isMain: boolean;
  sortOrder: number;
  size: number;
  url: string;
  type: number;
  extension: string;
}

export interface ConversationUserEntry {
  id: number;
  firstName: string;
  lastName: string;
  picture: string | null;
}