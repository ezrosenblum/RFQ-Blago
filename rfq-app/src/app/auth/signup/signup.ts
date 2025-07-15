// src/app/auth/signup/signup.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth} from '../../services/auth';
import { SignupRequest } from '../../models/auth.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup implements OnInit, OnDestroy {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  private destroy$ = new Subject<void>();

  userRoles = [
    { value: UserRole.CLIENT, label: 'Client (Request Quotes)' },
    { value: UserRole.VENDOR, label: 'Vendor (View & Respond to RFQs)' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
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
    this.signupForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.CLIENT, [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordStrengthValidator(control: AbstractControl): { [key: string]: any } | null {
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
          hasSpecial
        }
      };
    }
    return null;
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
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
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const signupData: SignupRequest = {
        email: this.signupForm.value.email.trim().toLowerCase(),
        password: this.signupForm.value.password,
        firstName: this.signupForm.value.firstName.trim(),
        lastName: this.signupForm.value.lastName.trim(),
        role: this.signupForm.value.role
      };

      this.authService.signup(signupData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = 'Account created successfully! You will be redirected shortly.';
            setTimeout(() => {
              console.log('Signup successful:', response);
            }, 1500);
          },
          error: (error) => {
            this.isLoading = false;
            this.handleSignupError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleSignupError(error: any): void {
    if (error.status === 409) {
      this.errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
    } else if (error.status === 400) {
      this.errorMessage = 'Invalid data provided. Please check your inputs and try again.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
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
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['requiredTrue']) return 'You must agree to the terms and conditions';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} contains invalid characters`;
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
    const password = this.signupForm.get('password');
    if (!password?.value) return '';

    const value = password.value;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const isLongEnough = value.length >= 8;

    const criteriaCount = [hasNumber, hasUpper, hasLower, hasSpecial, isLongEnough].filter(Boolean).length;

    if (criteriaCount < 3) return 'weak';
    if (criteriaCount < 5) return 'medium';
    return 'strong';
  }
}
