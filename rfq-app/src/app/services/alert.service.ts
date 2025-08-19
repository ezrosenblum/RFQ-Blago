import { Injectable, inject } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private translate = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  confirmButtonColor: string = '#1b84ff';
  cancelButtonColor: string = '#9ca3af';

  confirm(
    textKey: string,
    icon: SweetAlertIcon = 'warning'
  ): Promise<SweetAlertResult> {
    return new Promise((resolve) => {
      this.translate
        .get([textKey, 'ALERTS.TITLE', 'ALERTS.CONFIRM', 'ALERTS.CANCEL'])
        .subscribe((t) => {
          Swal.fire({
            title: t['ALERTS.TITLE'],
            text: t[textKey],
            icon,
            showCancelButton: true,
            confirmButtonText: t['ALERTS.CONFIRM'],
            cancelButtonText: t['ALERTS.CANCEL'],
            confirmButtonColor: this.confirmButtonColor,
            cancelButtonColor: this.cancelButtonColor,
            didOpen: () => {
              const swalContainer = document.querySelector('.swal2-container') as HTMLElement;
              if (swalContainer) {
                swalContainer.style.zIndex = '3000';
              }
            },
          }).then(resolve);
        });
    });
  }

  private open(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  success(key: string) {
    this.translate.get(key).subscribe((msg) => this.open(msg));
  }

  error(key: string) {
    this.translate.get(key).subscribe((msg) => this.open(msg));
  }

  info(key: string) {
    this.translate.get(key).subscribe((msg) => this.open(msg));
  }

  warn(key: string) {
    this.translate.get(key).subscribe((msg) => this.open(msg));
  }

  openSnackBar(message: string) {
    this.open(message);
  }
}
