import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private translate: TranslateService) {}

  extractErrorMessage(error: any): string {
    if (error?.status === 400 && error.error?.errors) {
      const firstKey = Object.keys(error.error.errors)[0];
      return error.error.errors[firstKey][0];
    }

    if (error?.status === 409) {
      return this.translate.instant('AUTH.ERROR_EMAIL_EXISTS');
    }

    if (error?.status === 422) {
      return this.translate.instant('AUTH.ERROR_CHECK_FIELDS');
    }

    if (error?.error?.detail) {
      return error.error.detail;
    }

    return this.translate.instant('AUTH.ERROR_GENERIC');
  }
  handleError(error: any): string {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return this.extractErrorMessage(error);
  }
}
