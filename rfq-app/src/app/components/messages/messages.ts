import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Activity, Conversation, Message } from '../../models/messages.model';
import { MessagesService } from '../../services/messages';
import { map, Observable, startWith, take } from 'rxjs';
import {
  MatDialog,
} from '@angular/material/dialog';
import { ActualFileObject, FilePondInitialFile } from 'filepond';
import { FileItem } from '../../models/form-validation';
import { FilePondComponent } from 'ngx-filepond';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Auth } from '../../services/auth';
import { FormControl } from '@angular/forms';
import { MessageAdminConversationEntry, MessageAdminConversationList, MessageConevrsationRequest, User, userChat } from '../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-messages',
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
    animations: [
    trigger('messagesSidenavMobile', [
      state('in', style({
        width: '100%',
        opacity: '1',
      })),
      state('out', style({
        opacity: '0',
        width: '0',
      })),
      transition('in => out', animate('50ms ease-in-out')),
      transition('out => in', animate('50ms ease-in-out'))
    ]),
  ]
})
export class MessagesComponent implements OnInit {
  searchTerm: string = '';
  filteredConversations: MessageAdminConversationEntry[] = [];
  newMessage: string = '';
  selectedChatIndex: number = 0;
  loadingConversations: boolean = true;
  loadingChatMessages: boolean = false;
  isDarkMode: boolean = true;
  readonly dialog = inject(MatDialog);
  
  conversations: MessageAdminConversationEntry[] = [];
  adminConversations: MessageAdminConversationEntry[] = [];
  filteredAdminConversations: MessageAdminConversationEntry[] = [];
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
  sidenavTrigger: string = 'out';
  errorMessage = '';
  isAdmin: boolean = false;
  currentUser: User | null = null;

  vendorSearchControl = new FormControl();
  vendorItems: userChat[] = [{name: 'Mary', email: 'marry@email.com', id: 12}, {name: 'Shelley', email: 'shelley@email.com', id: 13}, {name: 'Igor', email: 'igor@email.com', id: 14}];
  filteredVendorOptions!: Observable<userChat[]>;

  customerSearchControl = new FormControl();
  customerItems: userChat[] = [{name: 'Mary', email: 'marry@email.com', id: 12}, {name: 'Shelley', email: 'shelley@email.com', id: 13}, {name: 'Igor', email: 'igor@email.com', id: 14}];
  filteredCustomerOptions!: Observable<userChat[]>;
  colorPalette: Array<string> = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'];

  constructor(
    private _messageService: MessagesService,
    private _authService: Auth,
  ){
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
  }

  ngOnInit(): void {
    this._authService.currentUserSubject.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.isAdmin = user.type === 'Administrator';
          if (this.isAdmin) {
            this.loadAdminConversations();
          } else {
            this.loadConversations();
          }
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    })

    this.getUserData();
  }

  getUserData(): void {
        this._messageService.getAllVendorsWithConversations().pipe(take(1)).subscribe({
      next: (data: userChat[]) => {
        this.vendorItems = data.map(conv => ({
          name: conv.name,
          email: conv.email,
          id: conv.id
        }));
      },

      error: (error) => {
        this.handleError(error);
      },
    });

    this._messageService.getAllCustomersWithConversations().pipe(take(1)).subscribe({
      next: (data: userChat[]) => {
        this.customerItems = data.map(conv => ({
          name: conv.name,
          email: conv.email,
          id: conv.id
        }));
      },

      error: (error) => {
        this.handleError(error);
      },
    });

    this.filteredVendorOptions = this.vendorSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterVendors(name as string) : this.vendorItems.slice();
      }),
    );

    this.filteredCustomerOptions = this.customerSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterCustomers(name as string) : this.customerItems.slice();
      }),
    );

    this.vendorSearchControl.valueChanges.subscribe(data => {
      this.loadAdminConversations();
    });

    this.customerSearchControl.valueChanges.subscribe(data => {
      debugger
    });
  }

  displayFn(user: userChat): string {
    return user && user.name ? user.name : '';
  }

  private _filterVendors(name: string): userChat[] {
    const filterValue = name.toLowerCase();

    return this.vendorItems.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  private _filterCustomers(name: string): userChat[] {
    const filterValue = name.toLowerCase();

    return this.customerItems.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.searchTerm = value.toLowerCase();
    this.filteredConversations = this.conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(this.searchTerm) ||
        conv.vendor.firstName.toLowerCase().includes(this.searchTerm) ||
        conv.vendor.lastName.toLowerCase().includes(this.searchTerm) ||
        conv.submission.title.toLowerCase().includes(this.searchTerm)
    );
  }

  get selectedConversation(): MessageAdminConversationEntry | null {
    if (this.isAdmin && this.adminConversations.length > 0) {
      return this.adminConversations[this.selectedChatIndex];
    } else if (this.conversations.length > 0 && this.selectedChatIndex >= 0) {
      return this.conversations[this.selectedChatIndex];
    } else {
      this.loadingChatMessages
      return null;
    }
  }

  selectChat(index: number): void {
    this.selectedChatIndex = index;
    //this.loadMessagesForConversation(index);
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

      this._messageService.sendMessage(message).pipe(take(1)).subscribe({
         next: (data) => {
          this.currentMessages.push(message);
          this.newMessage = '';

          // this.conversations[
          //   this.selectedChatIndex
          // ].lastMessage = `You: ${message.content}`;
          // this.conversations[this.selectedChatIndex].time = message.time;
         },
         error: (error) => {},
      })
    }
  }

  private loadAdminConversations(): void {
    let request: MessageConevrsationRequest;
    request = {
      vendorId: this.vendorSearchControl?.value?.id || 0,
      submissionUserId: this.customerSearchControl?.value?.id || 0,
      paging: {
        pageNumber: 1,
        pageSize: 10
      },
      sorting: {
        field: 1,
        sortOrder: 1
      }
    };
    
    this._messageService.getAdminMessageConversations(request).pipe(take(1)).subscribe({
      next: (data: MessageAdminConversationList) => {
        this.adminConversations = data.items;
        this.filteredAdminConversations = this.adminConversations;
        this.loadingConversations = false;
        this.selectChat(0);
      },
      error: (error) => {
        this.loadingConversations = false;
      },
    });
  }

  private loadConversations(): void {
    let request: MessageConevrsationRequest;
    request = {
      vendorId: this.vendorSearchControl?.value?.id || 0,
      submissionUserId: this.currentUser?.id || 0,
      paging: {
        pageNumber: 1,
        pageSize: 10
      },
      sorting: {
        field: 1,
        sortOrder: 1
      }
    };

    this._messageService.getMessageConversations(request).pipe(take(1)).subscribe({
      next: (data: MessageAdminConversationList) => {
        this.conversations = data.items;
        this.filteredConversations = this.conversations;
        this.loadingConversations = false;
        this.selectChat(0);
      },
      error: (error) => {
        this.loadingConversations = false;
      },
    });
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
    this.showUploadFilesPanel = !this.showUploadFilesPanel;
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

  triggerMessagesMobile() {
    if (window.innerWidth <= 900) {
      if (this.sidenavTrigger === 'in') {
        this.sidenavTrigger = 'out';
      } else {
        this.sidenavTrigger = 'in';
      }
    }
  } 

  ngAfterViewChecked() {
    if (window.innerWidth > 900) {
      this.sidenavTrigger = 'out';
    }
  }

  removeConversation(): void {
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      if (this.conversations && this.conversations.length > 0 && this.selectedChatIndex >= 0) {
        this._messageService.deleteMessageConversation().pipe(take(1)).subscribe({
          next: (data: Conversation[]) => {
            this.conversations.splice(this.selectedChatIndex, 1);
            this.filteredConversations = this.conversations;
            if (this.selectedChatIndex >= this.conversations.length) {
              this.selectedChatIndex = Math.max(0, this.conversations.length - 1);
            }

            if (!this.isAdmin) {
              this.loadMessagesForConversation(1);
            }            
          },
          error: (error) => {
            this.handleError(error)
          },
        })
      }
    }
  }

  transform(value: string | undefined | null) {
    if (value) {
      let names = value.split(' ');
      let initials = names[0].substring(0, 1).toUpperCase();
      return initials;
    } else {
      return '';
    }
  }

mapLetterToElement(name: string): any | undefined {
  if (!name) return this.colorPalette[0];

  const firstLetter = name.charAt(0).toUpperCase();
  const asciiCode = firstLetter.charCodeAt(0);

  if (asciiCode >= 65 && asciiCode <= 90) {
    const index = (asciiCode - 65) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  return this.colorPalette[0];
}


  handleError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      this._authService.logout();
    } else if (error.status === 403) {
      this.errorMessage = 'You do not have permission to view this content.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'An error occurred while loading RFQs.';
    }
  }
}
