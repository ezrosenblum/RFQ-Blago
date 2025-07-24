import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private _fb: FormBuilder, private authService: Auth, private router: Router) {
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
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
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

    // this.authService.forgotPassword(resetPasswordData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       this.isLoading = false;
    //       this.router.navigate(['/auth/login']);
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //     }
    //   });
  }

  navigateToSignup(): void {
    this.isLoading = false;
    this.router.navigate(['/auth/signup']);
  }
}
