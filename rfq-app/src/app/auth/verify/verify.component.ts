import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { VerifyData } from '../../models/auth.model';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-verify',
  standalone: false,
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss'
})
export class VerifyComponent {

  verifyData: VerifyData = {};
  showSpinner: boolean = true;
  timeOut: number = 5000;
  timeOutError: number = 3000;

  constructor(private _router: Router, private _authService: Auth) { this.getData();}

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
            setTimeout(() => {
              this.showSpinner = false;
              this._router.navigate(['auth/login']);
            }, this.timeOut);
          },
          (error) => {
            setTimeout(() => {
              this.showSpinner = false;
              this._router.navigate(['auth/login']);
            }, this.timeOutError);
          }
        );
    }
  }
}
