import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { User } from '../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { Auth } from './auth';
import { NotificationData } from './notification-data';
import { SignalRNotification, UnreadNotificationsCount } from '../models/notifications.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService implements OnDestroy {
  private _hubConnection!: signalR.HubConnection;
  private _currentUser: User | null = null;
  private _userGroup: string | null = null;
  private _receivedNotificationIds: Set<number> = new Set();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _unreadNotification: Subject<SignalRNotification> = new Subject<SignalRNotification>();
  private _unreadNotificationsCount: Subject<UnreadNotificationsCount> = new Subject<UnreadNotificationsCount>();

  public unreadNotification: Observable<SignalRNotification> = this._unreadNotification.asObservable();
  public unreadNotificationsCount: Observable<UnreadNotificationsCount> = this._unreadNotificationsCount.asObservable();

  constructor(
    private _authService: Auth,
    private _snackBar: MatSnackBar,
    private _notificationService: NotificationData
  ) {
    this._authService.currentUser$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user) => {
        this._currentUser = user;
        if (user) {
          this.setupSignalR();
        }
      });

    this._authService.isAuthenticated$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((isAuthenticated) => {
        if (!isAuthenticated && this._userGroup) {
          this.leaveGroup(this._userGroup, true);
          this._userGroup = null;
        }
      });
  }

  async setupSignalR(): Promise<void> {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Error)
      .withUrl(`https://hub.rfq.techup.me/notification`, {
        accessTokenFactory: () => this._authService.getToken() || '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this._hubConnection.onreconnecting((error?: Error) => {
      console.error('SignalR reconnecting due to:', error);
    });

    this._hubConnection.onreconnected((connectionId?: string) => {
      console.log('Reconnected with ID:', connectionId);
      if (this._userGroup) {
        this.joinGroup(this._userGroup);
      }
    });

    try {
      await this._hubConnection.start();
      console.log('SignalR started');
      this.setupEventListeners();

      this._userGroup = `user_${this._currentUser?.id}`;
      this.joinGroup(this._userGroup);
    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  }

  private setupEventListeners(): void {
    this._hubConnection.on('NewNotification', (notification: SignalRNotification) => {

      if (this._receivedNotificationIds.has(notification.id)) {
        console.log(`Duplicate notification: ${notification.id}`);
        return;
      }

      this._receivedNotificationIds.add(notification.id);
      this._unreadNotification.next(notification);

      this._notificationService.getNotificationCount()
        .pipe(take(1))
        .subscribe((res) => {
          const count = typeof res === 'number' ? res : res.count;
          this._unreadNotificationsCount.next({ count });
        });

      const snackBarRef = this._snackBar.open(
        this.formatNotification(notification),
        'View',
        {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
          panelClass: ['notification-snackbar'],
        }
      );

      snackBarRef.onAction().subscribe(() => {
        this.handleNotificationAction(notification);
      });
    });
  }


  private handleNotificationAction(notification: SignalRNotification): void {
    this._notificationService.changeStatus(notification.id, notification.status.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this._notificationService.getNotificationCount()
            .pipe(take(1))
            .subscribe((res) => {
              const count = typeof res === 'number' ? res : res.count;
              this._unreadNotificationsCount.next({ count });
            });
        },
        error: (err) => {
          console.error('Failed to change notification status', err);
        }
      });
  }

  private joinGroup(group: string): void {
    this._hubConnection.invoke('JoinGroup', group)
      .then(() => {
        console.log(`Joined SignalR group: ${group}`);
      })
      .catch((err) => {
        console.error('Failed to join group:', err);
      });
  }

  private leaveGroup(group: string, suppressError = false): void {
    this._hubConnection.invoke('LeaveGroup', group)
      .then(() => console.log(`Left SignalR group: ${group}`))
      .catch((err) => {
        if (!suppressError) console.error('Failed to leave group:', err);
      });
  }

  private parseNotificationData(notification: SignalRNotification) {
    try {
      const parsed = JSON.parse(notification.data);
      switch (notification.type.id) {
        case 1:
          return { rfqId: parsed.rfqId, title: parsed.title };
        case 2:
          return { quoteId: parsed.quoteId, vendorName: parsed.vendorName };
        default:
          return parsed;
      }
    } catch (e) {
      console.error('Invalid JSON in notification data:', e);
      return {};
    }
  }

  private formatNotification(notification: SignalRNotification): string {
    const data = this.parseNotificationData(notification);
    switch (notification.type.id) {
      case 1:
        return `New RFQ: ${data.title || 'N/A'}`;
      case 2:
        return `New Quote from ${data.vendorName || 'Vendor'}`;
      default:
        return `${notification.title}: ${notification.description}`;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    if (this._hubConnection) {
      this._hubConnection.stop();
    }
  }
}
