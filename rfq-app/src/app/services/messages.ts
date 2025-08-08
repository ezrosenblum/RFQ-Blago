// src/app/services/rfq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LookupValue, Rfq, RfqRequest, RfqStatistics, RfqStatus, SubmissionTableRequest, TableResponse, UnitType } from '../models/rfq.model';
import { Auth } from './auth';
import { ApiResponse } from '../models/api-response';
import { Conversation, Message } from '../models/messages.model';

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

  getMessageConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`https://api.npoint.io/0b4ecb8730623e507929`) // `${this.API_URL}Submission/units`
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getChatMessages(conversationId: number, url: string): Observable<Message[]> {
    return this.http.get<Message[]>(url) // `${this.API_URL}messages/thread/` + conversationId 
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
          return true
        })
      );
  }

}
