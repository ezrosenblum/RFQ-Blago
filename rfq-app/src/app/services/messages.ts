import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Rfq, TableResponse } from '../models/rfq.model';
import { Auth } from './auth';
import { Conversation, ConversationUserEntry, CreateMessage, Message, MessageEntry } from '../models/messages.model';
import { MessageAdminConversationEntry, MessageAdminConversationList, MessageConevrsationRequest, MessageConversationMessagesRequest, userChat } from '../models/user.model';

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

  getAllConversationUsersByRole(role: string): Observable<ConversationUserEntry[]> {
    return this.http.get<ConversationUserEntry[]>(`${this.API_URL}User/by/role?role=${role}`)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getChatMessage(quouteId: number): Observable<MessageEntry[]> {
    return this.http.get<MessageEntry[]>(`${this.API_URL}Submission/quote/message/${quouteId}`)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getChatMessageHistory(data: MessageConversationMessagesRequest): Observable<TableResponse<MessageEntry>> {
    return this.http.post<TableResponse<MessageEntry>>(`${this.API_URL}Submission/quote/message/search`, data)
      .pipe(
        map(response => {
          return response
        })
      );
  }

  sendMessage(data: FormData): Observable<boolean | null> {
    const headers = new HttpHeaders({
      'Skip-Content-Type': 'true',
    });
    return this.http.post<boolean>(`${this.API_URL}Submission/quote/message`, data, { headers })
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

  markMessageAsRead(id: number): Observable<any> {
    return this.http.put<any>(`${this.API_URL}Submission/quote/${id}/seen`, null)
      .pipe(
        map(response => {
          return response
        })
      );
  }

  downloadFile(mediaEntityType: number, entityId: number, mediaItemId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}Media/${mediaEntityType}/${entityId}/${mediaItemId}/download`, {
      responseType: 'blob'
    });
  }

}
