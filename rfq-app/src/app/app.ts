import { Component, OnInit } from '@angular/core';
import { Auth } from './services/auth';
import { TranslateService } from '@ngx-translate/core';
import { SignalRService } from './services/notification-signalr';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'rfq-system';

  constructor(
    private authService: Auth,
    private translate: TranslateService,
    private signalrService: SignalRService
  ) {}


  ngOnInit(): void {
    if (localStorage.getItem('rfqTokenAcc')) {
      this.authService.getUserData().subscribe({
        next: (user) => {
          this.authService.currentUserSubject.next(user);
          this.authService.isAuthenticatedSubject.next(true);
          return true;
        }
      });
    }
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
