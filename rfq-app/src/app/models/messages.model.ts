interface Conversation {
  id: number;
  company: string;
  initials: string;
  project: string;
  lastMessage: string;
  time: string;
  bgColor: string;
  hasIndicator?: boolean;
}

interface Message {
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

interface Activity {
  icon: string;
  title: string;
  subtitle?: string;
  date?: string;
  bgColor: string;
}