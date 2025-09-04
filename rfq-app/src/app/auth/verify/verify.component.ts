import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { VerifyData } from '../../models/auth.model';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-verify',
  standalone: false,
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {

  verifyData: VerifyData = {};
  showSpinner: boolean = true;
  timeOut: number = 10000;
  timeOutError: number = 3000;
  errorMessage = '';
  isVerified: boolean = false;

  constructor(private _router: Router, private _authService: Auth, private _translate: TranslateService,) { this.getData();}

  getData() {
    let token: string | null = null;
    let uid: string | null = null;
    const tokenParam = this._router.url.split('token=')[1];
    if (tokenParam) {
      const uidParam = tokenParam.split('&uid=');
      token = uidParam[0]?.split('&')[0] || null;
      uid = uidParam[1] || null;
    }
    this.verifyData.token = token;
    this.verifyData.uid = uid;
    if (this.verifyData.token && this.verifyData.uid) {
      this._authService
        .putVerify(this.verifyData)
        .subscribe(
          (data: any) => {
            this.showSpinner = false;
            this.isVerified = true;
            Swal.fire({
              icon: 'success',
              title: this._translate.instant('ALERTS.VERIFIED_SUCCESSFULLY'),
              text: this._translate.instant('ALERTS.REDIRECT_LOGIN'),
              timer: 2000,
              showConfirmButton: false,
            });

            setTimeout(() => {
              this._router.navigate(['auth/login']);
            }, this.timeOut);
          },
          (error) => {
            this.showSpinner = false;
            if (error.status != 0) {
              this.handleError(error);
              Swal.fire({
                icon: 'error',
                title: this._translate.instant('ALERTS.ERROR_TITLE'),
                text: this._translate.instant('ALERTS.INVALID_VERIFICATION_REQUEST'),
                timer: 2000,
                showConfirmButton: false,
              });

              setTimeout(() => {
                this._router.navigate(['auth/login']);
              }, this.timeOutError);
            } 
            else {
              Swal.fire({
                icon: 'success',
                title: this._translate.instant('ALERTS.VERIFIED_SUCCESSFULLY'),
                text: this._translate.instant('ALERTS.REDIRECT_LOGIN'),
                timer: 2000,
                showConfirmButton: false,
              });

              setTimeout(() => {
                this._router.navigate(['auth/login']);
              }, this.timeOut);
            }
          }
        );
    }
  }

  navigateToLogin(): void {
    this._router.navigate(['/auth/login']);
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
