import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { LoginRequest, ResendEmail } from '../../models/auth.model';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  isResendingCode = false;
  errorMessage = '';
  showPassword = false;

  private destroy$ = new Subject<void>();

  // Demo accounts for testing
  demoAccounts = [
    { email: 'vendor@demo.com', password: 'Test12345!', role: 'Vendor' },
    { email: 'client@demo.com', password: 'Test12345!', role: 'Customer' }
  ];
  isInit: boolean = true;
  showResentEmailButton: boolean = false;
  registeredEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private _translate: TranslateService,
    private _authService: Auth
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if (data) {
        const allowedTypes = ['Vendor', 'Administrator', 'Customer'];
        if (allowedTypes.includes(data.type)) {
          this.router.navigate(['/vendor-rfqs']);
        } else {
          this.router.navigate(['/request-quote']);
        }
      }
    });

    this.getQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      rememberMe: [false]
    });
  }
  getQueryParams(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (Object.keys(params).length > 0) {
        if (params['waitingVerification']) {
          this.showResentEmailButton = true;
        }
        if (params['email']) {
          this.registeredEmail = params['email'];
        }
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = {
        username: this.loginForm.value.email.trim().toLowerCase(),
        password: this.loginForm.value.password
      };

      this.authService.login(loginData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.authService.saveTokens(response);
            this.authService.getUserData().pipe(take(1)).subscribe((data: User) => {
              this.authService.currentUserSubject.next(data);
              this.authService.isAuthenticatedSubject.next(true);
              const allowedTypes = ['Vendor', 'Administrator', 'Customer'];
              if (allowedTypes.includes(data.type)) {
                this.router.navigate(['/vendor-rfqs']);
              } else {
                this.router.navigate(['/request-quote']);
              }
            });
          },
          error: (error) => {
            this.isLoading = false;
            error.error.detail ? this.errorMessage = error.error.detail : this.handleLoginError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many login attempts. Please try again later.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'Login failed. Please try again.';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  useDemoAccount(email: string, password: string): void {
    this.loginForm.patchValue({
      email: email,
      password: password
    });
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  resendCode() {
    let request: ResendEmail = new ResendEmail();
    request.email = this.registeredEmail!;
    this.isResendingCode = true;
    
    this.authService.resendCode(request).pipe(take(1))
      .subscribe(
        (data: any) => {
          this.isResendingCode = false;
          this.showResentEmailButton = false;
          this.registeredEmail = null;
          Swal.fire({
            icon: 'success',
            title: this._translate.instant('ALERTS.CODE_RESEND'),
            text: this._translate.instant('ALERTS.CHECK_EMAIL'),
            timer: 2000,
            showConfirmButton: false,
          });
        },
        (error) => {
          this.isResendingCode = false;
          if (error.status != 0) {
            this.handleError(error);
          } 
          else {
            Swal.fire({
              icon: 'success',
            title: this._translate.instant('ALERTS.CODE_RESEND'),
            text: this._translate.instant('ALERTS.CHECK_EMAIL'),
              timer: 2000,
              showConfirmButton: false,
            });
          }
        }
      );
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return this.translate.instant('AUTH.VALIDATION.REQUIRED', { field: fieldName });
      }
      if (field.errors['email']) {
        return this.translate.instant('AUTH.VALIDATION.EMAIL');
      }
      if (field.errors['minlength']) {
        return this.translate.instant('AUTH.VALIDATION.MIN_LENGTH', {
          field: fieldName,
          min: field.errors['minlength'].requiredLength
        });
      }
      if (field.errors['maxlength']) {
        return this.translate.instant('AUTH.VALIDATION.MAX_LENGTH', {
          field: fieldName,
          max: field.errors['maxlength'].requiredLength
        });
      }
    }
    return '';
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
