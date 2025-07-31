// src/app/auth/signup/signup.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Auth } from '../../services/auth';
import { SignupRequest } from '../../models/auth.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup implements OnInit, OnDestroy {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  isVendorDetailsStep = false;
  selectedFileName = '';

  private destroy$ = new Subject<void>();

  userRoles = [
    { value: UserRole.CLIENT, label: 'Client (Request Quotes)' },
    { value: UserRole.VENDOR, label: 'Vendor (View & Respond to RFQs)' },
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
    this.signupForm = this.fb.group(
      {
        // Basic user information
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z\s]*$/),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z\s]*$/),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.minLength(5),
            Validators.maxLength(100),
          ],
        ],
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
        role: [UserRole.CLIENT, [Validators.required]],
        companyName: [''],
        businessAddress: [''],
        contactPerson: [''],
        phoneNumber: [''],
        businessDescription: [''],
        companySize: [''],
        yearsInBusiness: [''],
        businessLicense: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  onRoleChange(): void {
    const role = this.signupForm.get('role')?.value;
    if (role === UserRole.VENDOR) {
      this.addVendorValidators();
    } else {
      this.removeVendorValidators();
      this.isVendorDetailsStep = false;
    }
  }

  private addVendorValidators(): void {
    const vendorFields = {
      companyName: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
      businessAddress: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
      ],
      contactPerson: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
      phoneNumber: [
        Validators.required,
        Validators.pattern(/^\+?[\d\s\-\(\)]{10,15}$/),
      ],
      businessDescription: [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000),
      ],
    };

    Object.keys(vendorFields).forEach((field) => {
      this.signupForm
        .get(field)
        ?.setValidators(vendorFields[field as keyof typeof vendorFields]);
      this.signupForm.get(field)?.updateValueAndValidity();
    });
  }

  private removeVendorValidators(): void {
    const vendorFields = [
      'companyName',
      'businessAddress',
      'contactPerson',
      'phoneNumber',
      'businessDescription',
    ];

    vendorFields.forEach((field) => {
      this.signupForm.get(field)?.clearValidators();
      this.signupForm.get(field)?.updateValueAndValidity();
      this.signupForm.get(field)?.setValue('');
    });
  }

  getSubmitButtonText(): string {
    if (this.isVendorDetailsStep) {
      return 'Create Account';
    }

    const role = this.signupForm.get('role')?.value;
    return role === UserRole.VENDOR ? 'Next' : 'Create Account';
  }

  isFormValidForCurrentStep(): boolean {
    if (this.isVendorDetailsStep) {
      return this.signupForm.valid;
    } else {
      const basicFields = [
        'firstName',
        'lastName',
        'email',
        'password',
        'confirmPassword',
        'role',
      ];
      return basicFields.every((field) => {
        const control = this.signupForm.get(field);
        return control && control.valid;
      });
    }
  }

  goBackToBasicInfo(): void {
    this.isVendorDetailsStep = false;
    this.errorMessage = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB';
        event.target.value = '';
        this.selectedFileName = '';
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage =
          'Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files only.';
        event.target.value = '';
        this.selectedFileName = '';
        return;
      }

      this.selectedFileName = file.name;
      this.signupForm.patchValue({ businessLicense: file });
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    const role = this.signupForm.get('role')?.value;
    if (role === UserRole.VENDOR && !this.isVendorDetailsStep) {
      if (this.isFormValidForCurrentStep()) {
        this.isVendorDetailsStep = true;
        this.errorMessage = '';
      } else {
        this.markBasicFieldsAsTouched();
      }
      return;
    }

    if (this.isFormValidForCurrentStep() && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const signupData: any = {
        email: this.signupForm.value.email.trim().toLowerCase(),
        password: this.signupForm.value.password,
        firstName: this.signupForm.value.firstName.trim(),
        lastName: this.signupForm.value.lastName.trim(),
        role: this.signupForm.value.role,
      };
      if (role === UserRole.VENDOR) {
        signupData.vendorDetails = {
          companyName: this.signupForm.value.companyName.trim(),
          businessAddress: this.signupForm.value.businessAddress.trim(),
          contactPerson: this.signupForm.value.contactPerson.trim(),
          phoneNumber: this.signupForm.value.phoneNumber.trim(),
          businessDescription: this.signupForm.value.businessDescription.trim(),
          companySize: this.signupForm.value.companySize || null,
          yearsInBusiness: this.signupForm.value.yearsInBusiness || null,
          businessLicense: this.signupForm.value.businessLicense || null,
        };
      }

      this.authService
        .signup(signupData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage =
              'Account created successfully! You will be redirected shortly.';
            setTimeout(() => {
              console.log('Signup successful:', response);
              this.router.navigate(['/dashboard']);
            }, 1500);
          },
          error: (error) => {
            this.isLoading = false;
            this.handleSignupError(error);
          },
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markBasicFieldsAsTouched(): void {
    const basicFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
      'role',
    ];
    basicFields.forEach((field) => {
      const control = this.signupForm.get(field);
      control?.markAsTouched();
    });
  }

  private handleSignupError(error: any): void {
    if (error.status === 409) {
      this.errorMessage =
        'An account with this email already exists. Please use a different email or try logging in.';
    } else if (error.status === 400) {
      this.errorMessage =
        'Invalid data provided. Please check your inputs and try again.';
    } else if (error.status === 0) {
      this.errorMessage =
        'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage =
        error.error?.message || 'Signup failed. Please try again.';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  private passwordStrengthValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const isLongEnough = value.length >= 8;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid =
      isLongEnough && hasNumber && hasUpper && hasLower && hasSpecial;

    if (!valid) {
      return {
        passwordStrength: {
          isLongEnough,
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
      if (confirmPassword.errors) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required'])
        return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['requiredTrue'])
        return 'You must agree to the terms and conditions';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength'])
        return `${this.getFieldDisplayName(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      if (field.errors['maxlength'])
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
      if (field.errors['pattern']) {
        if (fieldName === 'phoneNumber') {
          return 'Please enter a valid phone number';
        }
        return `${this.getFieldDisplayName(
          fieldName
        )} contains invalid characters`;
      }
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
      if (field.errors['passwordStrength']) {
        const requirements = [];
        const strength = field.errors['passwordStrength'];
        if (!strength.isLongEnough) requirements.push('at least 8 characters');
        if (!strength.hasNumber) requirements.push('one number');
        if (!strength.hasUpper) requirements.push('one uppercase letter');
        if (!strength.hasLower) requirements.push('one lowercase letter');
        if (!strength.hasSpecial) requirements.push('one special character');
        return `Password must contain ${requirements.join(', ')}`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      role: 'Role',
      companyName: 'Company name',
      businessAddress: 'Business address',
      contactPerson: 'Contact person',
      phoneNumber: 'Phone number',
      businessDescription: 'Business description',
      companySize: 'Company size',
      yearsInBusiness: 'Years in business',
    };
    return fieldNames[fieldName] || fieldName;
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
  get message(): string {
    return this.isVendorDetailsStep
      ? 'Tell us about your business'
      : 'Join the RFQ system to start requesting or providing quotes';
  }
}
