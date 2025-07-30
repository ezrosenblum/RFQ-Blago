import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { Subject, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetRequest } from '../../models/auth.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if already logged in
    // if (this.authService.isAuthenticated()) {
    //   this.router.navigate(['/request-quote']);
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
            this.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordStrengthValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;

    if (!valid) {
      return {
        passwordStrength: {
          hasNumber,
          hasUpper,
          hasLower,
          hasSpecial,
        },
      };
    }
    return null;
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove the error if passwords match
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const rawToken = this.route.snapshot.queryParamMap.get('token');
    const uid = this.route.snapshot.queryParamMap.get('uid');

    if (!rawToken || !uid) {
      this.snackBar.open(
        'Invalid or missing reset link. Please try again.',
        'Close',
        { duration: 3000, panelClass: ['snackbar-error'] }
      );
      return;
    }

    const request = new PasswordResetRequest(
      rawToken,
      uid,
      this.resetPasswordForm.get('password')!.value
    );

    this.isLoading = true;

    this.authService
      .resetPassword(request)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            'Password reset successful! You can now log in.',
            'Close',
            {
              duration: 3000,
              panelClass: ['snackbar-success'],
            }
          );
          this.navigateToLogin();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleResetPasswordError(error);
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        },
      });
  }

  private handleResetPasswordError(error: any): void {
    const messages: { [key: number]: string } = {
      400: 'Invalid or expired token. Please request a new password reset link.',
      422: 'The provided password does not meet security requirements.',
      0: 'Unable to connect to the server. Please check your internet connection.',
    };

    this.errorMessage =
      messages[error.status] ||
      error.error?.message ||
      'Password reset failed. Please try again.';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach((key) => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const fieldLabel = this.translate.instant(`FIELDS.${fieldName}`);

      if (field.errors['required']) {
        return this.translate.instant('AUTH.VALIDATION.REQUIRED', { field: fieldLabel });
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
      if (field.errors['pattern']) {
        return this.translate.instant('AUTH.VALIDATION.PATTERN', { field: fieldLabel });
      }
      if (field.errors['passwordMismatch']) {
        return this.translate.instant('AUTH.VALIDATION.PASSWORD_MISMATCH');
      }
      if (field.errors['passwordStrength']) {
        const strength = field.errors['passwordStrength'];
        const requirements = [];

        if (!strength.hasNumber) requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.NUMBER'));
        if (!strength.hasUpper) requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.UPPER'));
        if (!strength.hasLower) requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.LOWER'));
        if (!strength.hasSpecial) requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.SPECIAL'));

        return this.translate.instant('AUTH.VALIDATION.PASSWORD_STRENGTH', {
          rules: requirements.join(', ')
        });
      }
    }
    return '';
  }

  getPasswordStrength(): string {
    const password = this.resetPasswordForm.get('password');
    if (!password?.value) return '';

    const value = password.value;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const isLongEnough = value.length >= 8;

    const criteriaCount = [
      hasNumber,
      hasUpper,
      hasLower,
      hasSpecial,
      isLongEnough,
    ].filter(Boolean).length;

    if (criteriaCount < 3) return 'weak';
    if (criteriaCount < 5) return 'medium';
    return 'strong';
  }
}
