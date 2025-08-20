import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MediaItem, Rfq, TableResponse } from '../models/rfq.model';
import { Auth } from './auth';
import { Conversation, ConversationUserEntry, CreateMessage, Message, MessageEntry, MessageMediaEntry } from '../models/messages.model';
import { MessageAdminConversationEntry, MessageAdminConversationList, MessageConevrsationRequest, MessageConversationMessagesRequest, userChat } from '../models/user.model';
import { AlertService } from './alert.service';

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
    private alertService: AlertService
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

  downloadFileLink(mediaEntityType: number, entityId: number, mediaItemId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}Media/${mediaEntityType}/${entityId}/${mediaItemId}/download`, {
      responseType: 'blob'
    });
  }

  downloadFile(file: MessageMediaEntry | MediaItem, format: string, previewImageInFullScreen: (url: string, format: string) => void) {
    const result = this.extractIdsFromUrl(file.url);
    if (result && result.entityId && result.typeId) {
      this.downloadFileLink(result.typeId, result.entityId, file.id)
        .pipe(take(1))
        .subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            if (format !== 'pdf') {
              link.download = file.name || `download_${file.id}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } else {
              previewImageInFullScreen(url, format);
            }
          },
          error: () => {
            this.alertService.error('VENDOR.FILE_PREVIEW_ERROR');
          },
        });
    } else {
      this.alertService.error('VENDOR.FILE_PREVIEW_ERROR');
    }
  }

  private extractIdsFromUrl(url: string): { typeId: number; entityId: number } | null {
    try {
      const parts = url.split('/documents/')[1]?.split('/');
      if (!parts || parts.length < 2) return null;

      const typeId = Number(parts[0]);
      const entityId = Number(parts[1]);

      if (isNaN(typeId) || isNaN(entityId)) return null;

      return { typeId, entityId };
    } catch {
      return null;
    }
  }

}
