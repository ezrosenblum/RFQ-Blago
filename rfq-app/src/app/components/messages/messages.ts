import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Activity, Conversation, Message } from '../../models/messages.model';
import { MessagesService } from '../../services/messages';
import { take } from 'rxjs';
import {
  MatDialog,
} from '@angular/material/dialog';
import { ActualFileObject, FilePondInitialFile } from 'filepond';
import { FileItem } from '../../models/form-validation';
import { FilePondComponent } from 'ngx-filepond';

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
  loadingConversations: boolean = true;
  loadingChatMessages: boolean = true;
  isDarkMode: boolean = true;
  readonly dialog = inject(MatDialog);
  
  conversations: Conversation[] = [];
  currentMessages: Message[] = [];

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
  
  showUploadFilesPanel: boolean = false;
  pondOptions = {
      allowMultiple: true,
      maxFiles: 5,
      labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
    };
  
  pondFiles: (string | FilePondInitialFile | Blob | ActualFileObject)[] = [];

  @ViewChild('myPond') myPond!: FilePondComponent;
  uploadedFilesCount = 0;

  constructor(
    private _messageService: MessagesService
  ){
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
  }

  ngOnInit(): void {
    this._messageService.getMessageConversations().pipe(take(1)).subscribe({
      next: (data: Conversation[]) => {
        this.conversations = data;
        this.filteredConversations = this.conversations;
        this.loadingConversations = false;
        this.selectChat(0);
      },
      error: (error) => {
        this.loadingConversations = false;
      },
    })
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

      // this._messageService.sendMessage(message).pipe(take(1)).subscribe({
      //   next: (data) => {
          this.currentMessages.push(message);
          this.newMessage = '';

          this.conversations[
            this.selectedChatIndex
          ].lastMessage = `You: ${message.content}`;
          this.conversations[this.selectedChatIndex].time = message.time;
        // },
        // error: (error) => {},
      //})
    }
  }

  private loadMessagesForConversation(index: number): void {
    // Dummy test data
    let url;
    switch(index) { 
      case 0: { 
          url = 'https://api.npoint.io/7b44e477a68e814b29c5';
          break; 
      } 
      case 1: { 
          url = 'https://api.npoint.io/592d1831918d41b892d1';
          break; 
      } 
      case 2: { 
          url = 'https://api.npoint.io/f26e5eeda168713955f6'; 
          break; 
      }
      case 3: { 
          url = 'https://api.npoint.io/1046ff931f6f34f482ec'; 
          break; 
      }
      default: { 
          url = 'https://api.npoint.io/7b44e477a68e814b29c5';
          break; 
      } 
    }

    this._messageService.getChatMessages(index, url).pipe(take(1)).subscribe({
      next: (data: Message[]) => {
      this.currentMessages = data;
      this.loadingChatMessages = false;
      },
      error: (error) => {
        this.loadingChatMessages = false;
      },
    })
  }

  openFileUploadDialog(){
    this.showUploadFilesPanel = true;
  }

  pondHandleInit() {
  }

pondHandleAddFile(event: any) {
  this.uploadedFilesCount++;
}

onFileRemoved(event: any) {
  this.uploadedFilesCount = Math.max(0, this.uploadedFilesCount - 1);
}

  pondHandleActivateFile(event: any) {
  }

  onFilesUpdated(files: (string| FilePondInitialFile | Blob | ActualFileObject)[]): void {
    this.pondFiles = files;

    const rawFiles: File[] = files
    .map(file => {
      if (typeof file === 'string') return null;
      if ('file' in file) return file.file as File;
      if (file instanceof Blob) return file as File;
      return null;
    })
    .filter((f): f is File => f !== null);

    console.log('raw files', rawFiles)
  }
}
