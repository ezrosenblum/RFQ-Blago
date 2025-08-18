import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Activity, Conversation, ConversationUserEntry, CreateMessage, Message, MessageEntry } from '../../models/messages.model';
import { MessagesService } from '../../services/messages';
import { find, map, Observable, of, startWith, take } from 'rxjs';
import {
  MatDialog,
} from '@angular/material/dialog';
import { FilePondComponent } from 'ngx-filepond';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Auth } from '../../services/auth';
import { FormControl } from '@angular/forms';
import { MessageAdminConversationEntry, MessageAdminConversationList, MessageConevrsationRequest, MessageConversationMessagesRequest, User, userChat } from '../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { TableResponse } from '../../models/rfq.model';
import { ImagePreviewDialog } from './image-preview-dialog/image-preview-dialog';
import { AlertService } from '../../services/alert.service';

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
  // General properties
  currentUser: User | null = null;
  isAdmin: boolean = false;
  isDarkMode: boolean = true;
  errorMessage = '';
  colorPalette: Array<string> = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'];
  sidenavTrigger: string = 'out';

  // Left sidenav conversations
  conversations: MessageAdminConversationEntry[] = [];
  filteredConversations: MessageAdminConversationEntry[] = [];
  adminConversations: MessageAdminConversationEntry[] = [];
  filteredAdminConversations: MessageAdminConversationEntry[] = [];
  loadingConversations: boolean = true;
  selectedChatIndex: number = 0;
  pageSize: number = 100;
  pageNumber: number = 1;
  messagesPageSize: number = 100;
  messagesPageNumber: number = 1;

  // Autocomplete controls - Left sidenav
  vendorSearchControl = new FormControl();
  vendorItems: ConversationUserEntry[] = [];
  filteredVendorOptions!: Observable<ConversationUserEntry[]>;

  customerSearchControl = new FormControl();
  customerItems: ConversationUserEntry[] = [];
  filteredCustomerOptions!: Observable<ConversationUserEntry[]>;
  usersCalledByDefault: boolean = false;

  customerIdQuery: number | null = null;
  vendorIdQuery: number | null = null;
  quoteIdQuery: number | null = null;

  // Search conversations - Left sidenav
  searchTerm: string = '';

  // Main chat properties
  newMessage: string = '';
  loadingChatMessages: boolean = false;
  currentMessages: MessageEntry[] = [];

  // File upload properties - Main chat
  showUploadFilesPanel: boolean = false;
  pondOptions = {
      allowMultiple: true,
      maxFiles: 5,
      labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  };
  pondFiles: File[] = [];
  @ViewChild('myPond') myPond!: FilePondComponent;
  uploadedFilesCount = 0;
  
  isMessageSending: boolean = false;

  // Right sidenav properties
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

  constructor(
    private _messageService: MessagesService,
    private _authService: Auth,
    private route: ActivatedRoute,
    private _dialog: MatDialog,
    private alertService: AlertService
  ){
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    };
  }

  // Lifecycle Hooks
  ngOnInit(): void {
    this._authService.currentUserSubject.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.isAdmin = user.type === 'Administrator';
          if (!this.usersCalledByDefault) {
            this.getQueryParams();
            this.usersCalledByDefault = true;
          }
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  ngAfterViewChecked() {
    if (window.innerWidth > 900) {
      this.sidenavTrigger = 'out';
    }
  }

  getQueryParams(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (Object.keys(params).length > 0) {
        if (params['customerId']) {
          this.customerIdQuery = Number(params['customerId']);
        }
        if (params['vendorId']) {
          this.vendorIdQuery = Number(params['vendorId']);
        }
        if (params['quoteId']) {
          this.quoteIdQuery = Number(params['quoteId']);
        }
      }
      switch(this.currentUser?.type) { 
        case 'Vendor': { 
            this.loadConversations();
            break; 
        } 
        case 'Customer': { 
            this.loadConversations();
            break; 
        } 
        case 'Administrator': { 
            this.loadUsersListsAndSubscribeChanges();
            this.loadAdminConversations();
            break; 
        } 
      } 
    });
  }

  // API Data Fetching & Sending
  private loadUsersListsAndSubscribeChanges(): void {
    this._messageService.getAllConversationUsersByRole('Vendor').pipe(take(1)).subscribe({
      next: (data: ConversationUserEntry[]) => {
        this.vendorItems = data;
        this.filteredVendorOptions = of(this.vendorItems.slice());
      },

      error: (error) => {
        this.handleError(error);
      },
    });

    this._messageService.getAllConversationUsersByRole('Customer').pipe(take(1)).subscribe({
      next: (data: ConversationUserEntry[]) => {
        this.customerItems = data;
        this.filteredCustomerOptions = of(this.customerItems.slice());
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
  }

  private loadAdminConversations(): void {
    let request: MessageConevrsationRequest;
    request = {
      vendorId: this.vendorIdQuery ? this.vendorIdQuery : this.vendorSearchControl?.value?.id ? this.vendorSearchControl?.value?.id : this.currentUser?.type == 'Vendor' ? this.currentUser?.id : null,
      submissionUserId: this.customerIdQuery ? this.customerIdQuery : this.customerSearchControl?.value?.id || null,
      hasConversations: true,
      paging: {
        pageNumber: 1,
        pageSize: 10
      },
      sorting: {
        field: 4,
        sortOrder: 2
      }
    };

    this.customerIdQuery = null;
    this.vendorIdQuery = null;
    this._messageService.getAdminMessageConversations(request).pipe(take(1)).subscribe({
      next: (data: MessageAdminConversationList) => {
        this.adminConversations = data.items;
        this.filteredAdminConversations = this.adminConversations;
        this.loadingConversations = false;
        if (this.quoteIdQuery) {
          let findChatIndex = this.adminConversations.findIndex(el => el.id == this.quoteIdQuery)
          if (findChatIndex > -1) {
            this.selectChat(this.adminConversations[findChatIndex], findChatIndex);
          }
          this.quoteIdQuery = null;
        } else {
            this.selectChat(this.adminConversations[0], 0);
        }

      },
      error: (error) => {
        this.loadingConversations = false;
      },
    });
  }

  private loadConversations(): void {
    let request: MessageConevrsationRequest;
    request = {
      vendorId: this.vendorIdQuery ? this.vendorIdQuery : this.vendorSearchControl?.value?.id ? this.vendorSearchControl?.value?.id : this.currentUser?.type == 'Vendor' ? this.currentUser?.id : null,
      submissionUserId: this.customerIdQuery ? this.customerIdQuery : this.customerSearchControl?.value?.id || null,
      hasConversations: true,
      paging: {
        pageNumber: 1,
        pageSize: 100
      },
      sorting: {
        field: 4,
        sortOrder: 2
      }
    };

    this.customerIdQuery = null;
    this.vendorIdQuery = null;
    this._messageService.getMessageConversations(request).pipe(take(1)).subscribe({
      next: (data: MessageAdminConversationList) => {
        this.conversations = data.items;
        this.filteredConversations = this.conversations;
        this.loadingConversations = false;

        if (this.conversations.length > 0) {
          if (this.quoteIdQuery) {
            let findChatIndex = this.conversations.findIndex(el => el.id == this.quoteIdQuery)
            if (findChatIndex > -1) {
              this.selectChat(this.conversations[findChatIndex], findChatIndex);
            }
            this.quoteIdQuery = null;
          } else {
             this.selectChat(this.conversations[0], 0);
          }
        }
      },
      error: (error) => {
        this.loadingConversations = false;
      },
    });
  }

  private loadMessagesForConversation(quoteId: number): void {
    let request: MessageConversationMessagesRequest;
    request = {
      submissionQuoteId: quoteId,
      paging: {
        pageNumber: this.messagesPageNumber,
        pageSize: this.messagesPageSize
      },
      sorting: {
        field: 1,
        sortOrder: 1
      }
    };

    this._messageService.getChatMessageHistory(request).pipe(take(1)).subscribe({
      next: (data: TableResponse<MessageEntry>) => {
      this.currentMessages = Array.isArray(data.items) ? data.items : [];
      this.loadingChatMessages = false;

      // Mark as read
      let findSelectedQuoteIndex;
      if (this.isAdmin) {
        findSelectedQuoteIndex = this.adminConversations.findIndex(el => el.id == quoteId);
        if (findSelectedQuoteIndex > -1 && this.adminConversations[findSelectedQuoteIndex].lastMessage?.quoteMessageStatus?.name == 'Sent') {
          this.markMessageAsRead(this.adminConversations[findSelectedQuoteIndex]);
        }
      } else {
        findSelectedQuoteIndex = this.conversations.findIndex(el => el.id == quoteId);
        if (findSelectedQuoteIndex > -1 && this.conversations[findSelectedQuoteIndex].lastMessage?.quoteMessageStatus?.name == 'Sent') {
          this.markMessageAsRead(this.conversations[findSelectedQuoteIndex]);
        }
      }

      setTimeout(() => {
        const container = document.getElementById('chat-scrollable');
        if (container) {
           container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 500);
      },
      error: (error) => {
        this.loadingChatMessages = false;
      },
    })
  }

  sendMessage(): void {
    if (this.newMessage.trim() || this.pondFiles.length > 0) {
      const formData = new FormData();

      formData.append('SubmissionQuoteId', String(this.selectedConversation?.id || null));
      formData.append('Content', this.newMessage);

      this.pondFiles.forEach(file => {
        formData.append('Files', file, file.name);
      });
      this.isMessageSending = true;
      this._messageService.sendMessage(formData).pipe(take(1)).subscribe({
         next: (data) => {
          this.newMessage = '';
          this.pondFiles = [];
          this.uploadedFilesCount = 0;
          this.showUploadFilesPanel = false;
          if (this.selectedConversation) {
            this.loadMessagesForConversation(this.selectedConversation.id);
          }
          setTimeout(() => {
            this.isMessageSending = false;
            const container = document.getElementById('chat-scrollable');
            if (container) {
               container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 500);
         },
         error: (error) => {
          this.isMessageSending = false;
         },
      })
    } else {
      this.alertService.error('VENDOR.MESSAGE_MANDATORY');
    }
  }

  markMessageAsRead(conversation: MessageAdminConversationEntry) {
    this._messageService.markMessageAsRead(conversation.id).pipe(take(1)).subscribe({
      next: (data) => {
        if (this.isAdmin) {
          let findQuoteIndex = this.adminConversations.findIndex(el => el.id == conversation.id);
          if (findQuoteIndex > -1) {
            this.adminConversations[findQuoteIndex].lastMessage.quoteMessageStatus.name = 'Read';
          }
        } else {
          let findQuoteIndex = this.conversations.findIndex(el => el.id == conversation.id);
          if (findQuoteIndex > -1) {
            this.conversations[findQuoteIndex].lastMessage.quoteMessageStatus.name = 'Read';
          }
        }
      }
    });
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
              this.loadMessagesForConversation(this.selectedConversation?.id || 0);
            }            
          },
          error: (error) => {
            this.handleError(error)
          },
        })
      }
    }
  }

  // Filtering and Selection functions

  previewImageInFullScreen(url: string){
    const dialogRef = this._dialog.open(ImagePreviewDialog, {
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      panelClass: 'preview-image-dialog',
      autoFocus: false,
      data: {
        url: url,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: any) => {

      });
  }

  displayFn(user: ConversationUserEntry): string {
    return user && user.firstName ? `${user.firstName} ${user.lastName}` : '';
  }

  private _filterVendors(name: string): ConversationUserEntry[] {
    const filterValue = name.toLowerCase();

    return this.vendorItems.filter(option => option.firstName.toLowerCase().includes(filterValue) ||
      option.lastName.toLowerCase().includes(filterValue))
  }

  private _filterCustomers(name: string): ConversationUserEntry[] {
    const filterValue = name.toLowerCase();

    return this.customerItems.filter(option => option.firstName.toLowerCase().includes(filterValue) ||
      option.lastName.toLowerCase().includes(filterValue))
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    this.searchTerm = value.toLowerCase();
    if (!this.isAdmin) {
      if (this.searchTerm) {
        this.filteredConversations = this.conversations.filter(
          (conv) =>
            conv.title.toLowerCase().includes(this.searchTerm) ||
            conv.vendor.firstName.toLowerCase().includes(this.searchTerm) ||
            conv.vendor.lastName.toLowerCase().includes(this.searchTerm) ||
            conv.submission.user.firstName.toLowerCase().includes(this.searchTerm) ||
            conv.submission.user.lastName.toLowerCase().includes(this.searchTerm) ||
            conv.submission.title.toLowerCase().includes(this.searchTerm)
        );
      } else {
        this.filteredConversations = this.conversations
      }
    } 
    else {
      if (this.searchTerm) {
        this.filteredAdminConversations = this.adminConversations.filter(
          (conv) =>
            conv.title.toLowerCase().includes(this.searchTerm) ||
            conv.vendor.firstName.toLowerCase().includes(this.searchTerm) ||
            conv.vendor.lastName.toLowerCase().includes(this.searchTerm) ||
            conv.submission.title.toLowerCase().includes(this.searchTerm) ||
            conv.submission.user.firstName.toLowerCase().includes(this.searchTerm) ||
            conv.submission.user.lastName.toLowerCase().includes(this.searchTerm)
        );
      } else {
          this.filteredAdminConversations = this.adminConversations;
      }

    }

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

  selectChat(conv: MessageAdminConversationEntry, index: number): void {
    this.selectedChatIndex = index;
    this.loadMessagesForConversation(conv.id);
  }

  onVendorSelected(event: any): void {
    this.loadAdminConversations();
  }

  onCustomerSelected(event: any): void {
    this.loadAdminConversations();
  }


  // Upload files 
  toggleFileUploadPanel(){
    this.showUploadFilesPanel = !this.showUploadFilesPanel;
  }

  pondHandleAddFile(event: any) {
    if (event?.file?.file) {
      this.pondFiles.push(event.file.file as File);
    }
  }

  onFileRemoved(event: any) {
  if (event?.file?.file) {
      const removedFile = event.file.file as File;
      this.pondFiles = this.pondFiles.filter(f => f !== removedFile);
    }
  }

  // Other formatting and error handling methods
  triggerMessagesMobile() {
    if (window.innerWidth <= 900) {
      if (this.sidenavTrigger === 'in') {
        this.sidenavTrigger = 'out';
      } else {
        this.sidenavTrigger = 'in';
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

  mapLetterToElementById(userId: number): any | undefined {
    let findUser;
    if (this.currentUser?.type === 'Administrator') {
      findUser = this.adminConversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    } else {
      findUser = this.conversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    }

    if (findUser) {
      return this.mapLetterToElement(findUser.submission.user.firstName);
    } else
    {
      if (this.currentUser?.id === userId) {
        return this.mapLetterToElement(this.currentUser.firstName!);
      }
    }
  }

  getUserFirstNameById(userId: number): string {
    let findUser;
    if (this.currentUser?.type === 'Administrator') {
      findUser = this.adminConversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    } else {
      findUser = this.conversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    }

    if (findUser) {
      return findUser.submission.user.firstName;
    } else {
      if (this.currentUser?.id === userId) {
        return this.currentUser.firstName || '';
      }
    }
    return '';
  }

  getUserLastNameById(userId: number): string {
    let findUser;
    if (this.currentUser?.type === 'Administrator') {
      findUser = this.adminConversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    } else {
      findUser = this.conversations.find(item => item.submission.id === userId || item.vendor.id === userId);
    }

    if (findUser) {
      return findUser.submission.user.lastName;
    } else {
      if (this.currentUser?.id === userId) {
        return this.currentUser.lastName || '';
      }
    }
    return '';
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

  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(date);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
