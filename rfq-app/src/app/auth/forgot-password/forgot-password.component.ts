import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent  {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private _fb: FormBuilder, private authService: Auth, private router: Router, private translate: TranslateService) {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const fieldLabel = this.translate.instant(`FIELDS.${fieldName}`);

      if (field.errors['required']) {
        return this.translate.instant('AUTH.VALIDATION.REQUIRED', { field: fieldLabel });
      }
      if (field.errors['email']) {
        return this.translate.instant('AUTH.VALIDATION.EMAIL');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('AUTH.VALIDATION.MIN_LENGTH', {
          field: fieldLabel,
          min: field.errors['minlength'].requiredLength
        });
      }
      if (field.errors['maxlength']) {
        return this.translate.instant('AUTH.VALIDATION.MAX_LENGTH', {
          field: fieldLabel,
          max: field.errors['maxlength'].requiredLength
        });
      }
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.isLoading = true;

    const resetPasswordData: { email: string } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(resetPasswordData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
  }

  navigateToSignup(): void {
    this.isLoading = false;
    this.router.navigate(['/auth/signup']);
  }
}
