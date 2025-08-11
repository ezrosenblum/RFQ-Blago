import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Rfq } from '../models/rfq.model';
import { Auth } from './auth';
import { Conversation, Message } from '../models/messages.model';
import { MessageAdminConversationEntry, MessageAdminConversationList, MessageConevrsationRequest, userChat } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private readonly API_URL = environment.apiUrl;
  private readonly DEMO_MODE = true; // Set to false when connecting to real API

  // Demo RFQ database
  private demoRfqs: Rfq[] = [
  ];

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {}

  getMessageConversations(request: MessageConevrsationRequest): Observable<MessageAdminConversationList> {
    return this.http.post<MessageAdminConversationList>(`${this.API_URL}Submission/quote/search`, request)
      .pipe(
        map((response: MessageAdminConversationList) => {
          return response;
        })
      );
  }

  getAdminMessageConversations(request: MessageConevrsationRequest): Observable<MessageAdminConversationList> {
    return this.http.post<MessageAdminConversationList>(`${this.API_URL}Submission/quote/search`, request)
      .pipe(
        map((response: MessageAdminConversationList) => {
          return response;
        })
      );
  }

  getAllVendorsWithConversations(): Observable<userChat[]> {
    const headers = new HttpHeaders({
      'Skip-Content-Type': 'true',
    });
    let url = this.DEMO_MODE
      ? `https://api.npoint.io/99b3f35518b0a3b0800f`
      : `${this.API_URL}admin/users`;
    return this.http.get<userChat[]>(url, { headers })
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getAllCustomersWithConversations(): Observable<userChat[]> {
     const headers = new HttpHeaders({
      'Skip-Content-Type': 'true',
    });
    let url = this.DEMO_MODE
      ? `https://api.npoint.io/d3ea1ea4cf33b38b1952`
      : `${this.API_URL}admin/users`;
    return this.http.get<userChat[]>(url, { headers })
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getChatMessages(conversationId: number, url: string): Observable<Message[]> {
    const headers = new HttpHeaders({
      'Skip-Content-Type': 'true',
    });
    url = this.DEMO_MODE
      ? url
      : `${this.API_URL}messages/thread/${conversationId}`;
    return this.http.get<Message[]>(url, { headers })
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  sendMessage(data: Message): Observable<boolean | null> {
    return this.http.post<boolean>(`${this.API_URL}messages`, data)
      .pipe(
        map(response => {
          return response
        })
      );
  }

  deleteMessageConversation(): Observable<Conversation[]> {
    return this.http.delete<Conversation[]>(`${this.API_URL}messages`)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

}
