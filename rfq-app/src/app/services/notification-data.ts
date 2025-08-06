import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationPagedResponse, NotificationSearchParams, UnreadNotificationsCount } from '../models/notifications.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationData {
  private _apiUrl: string = 'https://api.rfq.techup.me/api/v1/Notification';

  constructor(private _httpClient: HttpClient) {}

  /**
   * Funciton to get notifications
   */
  public getNotificationsPaged(searchParams: NotificationSearchParams): Observable<NotificationPagedResponse> {
    return this._httpClient.post<NotificationPagedResponse>(`${this._apiUrl}/search/user`, searchParams);
  }


  /**
   * Funciton to set notification as read
   */
  public markAllAsReadNotification(): Observable<string> {
    return this._httpClient.put<string>(`${this._apiUrl}/user/mark-all-as-read`, null)
  }

  /**
   * Funciton to get notification count
   */
  public getNotificationCount(): Observable<UnreadNotificationsCount> {
    return this._httpClient.get<UnreadNotificationsCount>(`${this._apiUrl}/count/unread`)
  }

  // Mark one notification as read/unread
  public changeStatus(id: number, status: number): Observable<void> {
    return this._httpClient.put<void>(
      `${this._apiUrl}/${id}/change-status`,
      status,
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json'
      }
    );
  }

  // Get notification statuses (for filters etc.)
  getStatusLookup(): Observable<string[]> {
    return this._httpClient.get<string[]>(`${this._apiUrl}/lookup/status`)
  }
}