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

@Component({
  standalone: false,
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit{
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
    private snackBar: MatSnackBar
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

    const fullUrl = window.location.href;
    const match = fullUrl.match(/[?&]token=([^&#]*)/);
    const rawToken = match ? match[1] : null;

    const request = new PasswordResetRequest(
      rawToken!,
      this.route.snapshot.queryParams['uid'],
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
          this.navigateToLogin()
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
    if (error.status === 400) {
      this.errorMessage =
        'Invalid or expired token. Please request a new password reset link.';
    } else if (error.status === 422) {
      this.errorMessage =
        'The provided password does not meet security requirements.';
    } else if (error.status === 0) {
      this.errorMessage =
        'Unable to connect to the server. Please check your internet connection.';
    } else {
      this.errorMessage =
        error.error?.message || 'Password reset failed. Please try again.';
    }
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
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength'])
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength'])
        return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern'])
        return `${fieldName} contains invalid characters`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
      if (field.errors['passwordStrength']) {
        const requirements = [];
        const strength = field.errors['passwordStrength'];
        if (!strength.hasNumber) requirements.push('one number');
        if (!strength.hasUpper) requirements.push('one uppercase letter');
        if (!strength.hasLower) requirements.push('one lowercase letter');
        if (!strength.hasSpecial) requirements.push('one special character');
        return `Password must contain ${requirements.join(', ')}`;
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
