import { Component, OnInit } from '@angular/core';
import { Activity, Conversation, Message } from '../../models/messages.model';

@Component({
  standalone: false,
  selector: 'app-messages',
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class MessagesComponent implements OnInit {
  searchTerm: string = '';
  filteredConversations: Conversation[] = [];
  newMessage: string = '';
  selectedChatIndex: number = 0;

  conversations: Conversation[] = [
    {
      id: 1,
      company: 'Apex Digital Marketing',
      initials: 'AD',
      project: 'E-commerce platform redesign and optimization',
      lastMessage: 'Apex: The analytics dashboard integration looks perfect...',
      time: '2:15 PM',
      bgColor: 'bg-blue-500',
      hasIndicator: true,
    },
    {
      id: 2,
      company: 'Stellar Logistics Corp',
      initials: 'SL',
      project: 'Supply chain management system development',
      lastMessage: 'You: When can we schedule the final deployment?',
      time: '1:42 PM',
      bgColor: 'bg-green-500',
    },
    {
      id: 3,
      company: 'Phoenix Healthcare',
      initials: 'PH',
      project: 'Patient management system with AI diagnostics',
      lastMessage: 'Phoenix: The HIPAA compliance review is complete...',
      time: '1:18 PM',
      bgColor: 'bg-purple-500',
    },
    {
      id: 4,
      company: 'Zenith Financial',
      initials: 'ZF',
      project: 'Cryptocurrency trading platform development',
      lastMessage: 'You: The security audit results look excellent...',
      time: '12:55 PM',
      bgColor: 'bg-orange-500',
    },
    {
      id: 5,
      company: 'Nova Entertainment',
      initials: 'NE',
      project: 'Streaming platform with content management',
      lastMessage: 'Nova: We need to discuss the CDN implementation...',
      time: 'Yesterday',
      bgColor: 'bg-red-500',
    },
    {
      id: 6,
      company: 'Vortex Automotive',
      initials: 'VA',
      project: 'Fleet management and tracking system',
      lastMessage: 'You: The GPS integration is working flawlessly...',
      time: 'Yesterday',
      bgColor: 'bg-indigo-500',
    },
    {
      id: 7,
      company: 'Meridian Real Estate',
      initials: 'MR',
      project: 'Property listing platform with VR tours',
      lastMessage: 'Meridian: Can we add the mortgage calculator feature?',
      time: 'Tuesday',
      bgColor: 'bg-teal-500',
    },
    {
      id: 8,
      company: 'Cosmos EdTech',
      initials: 'CE',
      project: 'Online learning platform with gamification',
      lastMessage: 'You: The student progress tracking is implemented...',
      time: 'Monday',
      bgColor: 'bg-pink-500',
    },
  ];

  currentMessages: Message[] = [
    {
      sender: 'Apex Digital Marketing',
      content:
        "Hi there! We've reviewed your development proposal for our e-commerce platform redesign. The timeline looks good, but we'd like to discuss some additional features for the analytics dashboard. Could we schedule a call this week?",
      time: '1:45 PM',
      isUser: false,
      initials: 'AD',
      bgColor: 'bg-blue-500',
    },
    {
      sender: 'Apex Digital Marketing',
      content:
        "Perfect! Here's our project repository access: https://github.com/apex-digital/ecommerce-v2. Please review the current codebase and let us know your thoughts on the integration approach. Looking forward to working together!",
      time: '1:52 PM',
      isUser: false,
      initials: 'AD',
      bgColor: 'bg-blue-500',
      hasPreview: true,
      preview: {
        title: 'apex-digital/ecommerce-v2 - Overview',
        description:
          'Apex Digital Marketing e-commerce platform v2.0 with advanced analytics and user personalization features.',
        platform: 'GitHub',
      },
    },
    {
      sender: 'You',
      content:
        "Thanks for sharing the repository! I've had a chance to review the codebase and I'm impressed with the current architecture. The analytics integration should be straightforward with the existing structure. I can definitely complete this within the proposed timeline.",
      time: '2:08 PM',
      isUser: true,
      initials: 'YU',
      bgColor: 'bg-gray-500',
    },
    {
      sender: 'Apex Digital Marketing',
      content:
        "Excellent! We're excited to move forward with this project. The analytics dashboard integration looks perfect for our needs. When can we expect the first milestone deliverable? We're particularly interested in the real-time reporting features.",
      time: '2:15 PM',
      isUser: false,
      initials: 'AD',
      bgColor: 'bg-blue-500',
    },
  ];

  activities: Activity[] = [
    {
      icon: 'check',
      title: 'Project proposal accepted',
      date: 'July 29',
      bgColor: 'bg-green-500',
    },
    {
      icon: 'settings',
      title: 'Development contract signed',
      subtitle: 'E-commerce platform redesign project',
      bgColor: 'bg-blue-500',
    },
    {
      icon: 'play',
      title: 'Sprint 1 commenced',
      subtitle: 'Analytics dashboard development',
      bgColor: 'bg-purple-500',
    },
    {
      icon: 'check',
      title: 'Milestone 1 delivery',
      subtitle: 'Scheduled for August 5',
      bgColor: 'bg-orange-500',
    },
  ];

  ngOnInit(): void {
    this.filteredConversations = this.conversations;
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.searchTerm = value.toLowerCase();
    this.filteredConversations = this.conversations.filter(
      (conv) =>
        conv.company.toLowerCase().includes(this.searchTerm) ||
        conv.project.toLowerCase().includes(this.searchTerm) ||
        conv.lastMessage.toLowerCase().includes(this.searchTerm)
    );
  }

  get selectedConversation(): Conversation {
    return this.conversations[this.selectedChatIndex];
  }

  selectChat(index: number): void {
    this.selectedChatIndex = index;
    this.loadMessagesForConversation(index);
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message: Message = {
        sender: 'You',
        content: this.newMessage,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isUser: true,
        initials: 'YU',
        bgColor: 'bg-gray-500',
      };

      this.currentMessages.push(message);
      this.newMessage = '';

      this.conversations[
        this.selectedChatIndex
      ].lastMessage = `You: ${message.content}`;
      this.conversations[this.selectedChatIndex].time = message.time;
    }
  }

  private loadMessagesForConversation(index: number): void {
    const conversation = this.conversations[index];
    if (index === 0) {
    } else {
      this.currentMessages = [
        {
          sender: conversation.company,
          content: `Hello! Thanks for reaching out about the ${conversation.project} project. We're excited to work with you on this.`,
          time: '10:30 AM',
          isUser: false,
          initials: conversation.initials,
          bgColor: conversation.bgColor,
        },
        {
          sender: 'You',
          content:
            "Great! I've reviewed your proposal and it looks comprehensive. When can we start?",
          time: '10:45 AM',
          isUser: true,
          initials: 'YU',
          bgColor: 'bg-gray-500',
        },
        {
          sender: conversation.company,
          content:
            'We can start as early as next week. Let me know what works best for your timeline.',
          time: '11:00 AM',
          isUser: false,
          initials: conversation.initials,
          bgColor: conversation.bgColor,
        },
      ];
    }
  }
}
