import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { LookupValue } from '../../models/user.model';
import { CompanyDetails, UserRequest } from '../../models/auth.model';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MaterialCategoriesSelectionComponent } from '../../components/profile/material-categories-selection/material-categories-selection.component';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  selectedFileName: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  currentStep: 'basic' | 'vendor' | 'location' = 'basic';
  selectedFile: File | null = null;
  companySizes: LookupValue[] = [];
  userRoles: LookupValue[] = [];

  @ViewChild('materialCategoriesComponent')
  materialCategoriesComponent!: MaterialCategoriesSelectionComponent;
  clearCategoriesSubject = new Subject<boolean>();
  constructor(
    private fb: FormBuilder,
    private userService: Auth,
    private router: Router,
    private translate: TranslateService
  ) {}
  ngOnInit(): void {
    this.initializeForm();
    this.loadLookupData();
  }
  private loadLookupData(): void {
    this.userService.getUserRoles().subscribe({
      next: (roles) => {
        this.userRoles = roles;
      },
      error: () => {
        this.userRoles = [];
      },
    });
    this.userService.getCompanySizes().subscribe({
      next: (sizes) => {
        this.companySizes = sizes;
      },
      error: () => {
        this.companySizes = [];
      },
    });
  }
  get message(): string {
    switch (this.currentStep) {
      case 'basic':
        return this.translate.instant('AUTH.JOIN_PLATFORM_TO_MANAGE_RFQS');
      case 'vendor':
        return this.translate.instant('AUTH.PROVIDE_COMPANY_INFO_TO_REGISTER');
      case 'location':
        return this.translate.instant('AUTH.SET_LOCATION_AND_CATEGORIES');
      default:
        return '';
    }
  }
  get isVendorDetailsStep(): boolean {
    return this.currentStep === 'vendor';
  }
  get isLocationStep(): boolean {
    return this.currentStep === 'location';
  }
  private initializeForm(): void {
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
        phoneNumber: [''],
        name: [''],
        businessAddress: [''],
        latitude: [''],
        longitude: [''],
        operatingRadius: [''],
        contactPersonFirstName: [''],
        contactPersonLastName: [''],
        contactEmail: ['', [Validators.email]],
        contactPhone: [''],
        businessDescription: [''],
        companySize: [''],
        businessLicense: [''],
      },
      { validators: this.passwordMatchValidator }
    );
    this.signupForm.get('role')?.valueChanges.subscribe((roleName) => {
      const isVendor = this.isVendorRole(roleName);
      this.updateVendorFieldValidation(isVendor);
    });
  }
  private updateVendorFieldValidation(isVendor: boolean): void {
    const vendorFields = [
      'phoneNumber',
      'name',
      'businessAddress',
      'contactPersonFirstName',
      'contactPersonLastName',
      'businessDescription',
      'companySize',
    ];
    vendorFields.forEach((field) => {
      const control = this.signupForm.get(field);
      if (control) {
        if (isVendor) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
    });
  }
  private passwordValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const valid =
      hasUpperCase &&
      hasLowerCase &&
      hasNumeric &&
      hasSpecial &&
      password.length >= 8;
    if (!valid) {
      return {
        passwordStrength: {
          hasUpperCase: hasUpperCase,
          hasLowerCase: hasLowerCase,
          hasNumeric: hasNumeric,
          hasSpecial: hasSpecial,
          minLength: password.length >= 8,
        },
      };
    }
    return null;
  }
  private passwordMatchValidator(
    group: AbstractControl
  ): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    const confirmPasswordControl = group.get('confirmPassword');
    if (password && confirmPassword && password !== confirmPassword) {
      if (confirmPasswordControl) {
        confirmPasswordControl.setErrors({
          ...confirmPasswordControl.errors,
          passwordMismatch: true,
        });
      }
      return { passwordMismatch: true };
    } else {
      if (confirmPasswordControl && confirmPasswordControl.errors) {
        delete confirmPasswordControl.errors['passwordMismatch'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
      return null;
    }
  }
  onRoleChange(): void {
    const roleName = this.signupForm.get('role')?.value;
    const isVendor = this.isVendorRole(roleName);
    this.clearErrorMessages();
    this.updateVendorFieldValidation(isVendor);
  }
  isVendorRole(roleName: string): boolean {
    return roleName?.toLowerCase() === 'vendor';
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  getPasswordStrength(): string {
    const password = this.signupForm.get('password')?.value;
    if (!password) return '';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    const strength = [
      hasUpperCase,
      hasLowerCase,
      hasNumeric,
      hasSpecial,
      isLongEnough,
    ].filter(Boolean).length;
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.translate.get('AUTH.FILE_TOO_LARGE').subscribe((translation) => {
          this.errorMessage = translation;
        });
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
        this.translate
          .get('AUTH.INVALID_FILE_TYPE')
          .subscribe((translation) => {
            this.errorMessage = translation;
          });
        return;
      }
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.clearErrorMessages();
    }
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    const standardInvalid = !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
    if (fieldName === 'confirmPassword') {
      const hasPasswordMismatch = this.signupForm.errors?.['passwordMismatch'];
      const confirmPasswordTouched = field?.touched;
      return (
        standardInvalid || !!(hasPasswordMismatch && confirmPasswordTouched)
      );
    }
    return standardInvalid;
  }
  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors) return '';
    const errors = field.errors;
    if (errors['required']) {
      return this.translate.instant('AUTH.VALIDATION.REQUIRED', {
        field: this.getFieldLabel(fieldName),
      });
    }
    if (errors['email']) {
      return this.translate.instant('AUTH.VALIDATION.EMAIL');
    }
    if (errors['minlength']) {
      return this.translate.instant('AUTH.VALIDATION.MIN_LENGTH', {
        field: this.getFieldLabel(fieldName),
        min: errors['minlength'].requiredLength,
      });
    }
    if (fieldName === 'password' && errors['passwordStrength']) {
      const strength = errors['passwordStrength'];
      const requirements: string[] = [];
      if (!strength.hasUpperCase) {
        requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.UPPER'));
      }
      if (!strength.hasLowerCase) {
        requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.LOWER'));
      }
      if (!strength.hasNumeric) {
        requirements.push(this.translate.instant('AUTH.PASSWORD_RULES.NUMBER'));
      }
      if (!strength.hasSpecial) {
        requirements.push(
          this.translate.instant('AUTH.PASSWORD_RULES.SPECIAL')
        );
      }
      if (!strength.minLength) {
        requirements.push(
          this.translate.instant('AUTH.PASSWORD_RULES.MIN_LENGTH')
        );
      }
      return this.translate.instant('AUTH.VALIDATION.PASSWORD_STRENGTH', {
        rules: requirements.join(', '),
      });
    }
    if (fieldName === 'confirmPassword') {
      if (this.signupForm.errors?.['passwordMismatch']) {
        return this.translate.instant('AUTH.VALIDATION.PASSWORD_MISMATCH');
      }
      const password = this.signupForm.get('password')?.value;
      const confirmPassword = this.signupForm.get('confirmPassword')?.value;
      if (password && confirmPassword && password !== confirmPassword) {
        return this.translate.instant('AUTH.VALIDATION.PASSWORD_MISMATCH');
      }
    }
    return this.translate.instant('AUTH.VALIDATION.PATTERN', {
      field: this.getFieldLabel(fieldName),
    });
  }
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      role: 'Role',
      password: 'Password',
      confirmPassword: 'Confirm password',
      phoneNumber: 'Phone number',
      name: 'Company name',
      businessAddress: 'Business address',
      contactPersonFirstName: 'Contact person first name',
      contactPersonLastName: 'Contact person last name',
      businessDescription: 'Business description',
      companySize: 'Company size',
    };
    return labels[fieldName] || fieldName;
  }
  isFormValidForCurrentStep(): boolean {
    switch (this.currentStep) {
      case 'basic':
        const basicFields = [
          'firstName',
          'lastName',
          'email',
          'role',
          'password',
          'confirmPassword',
        ];
        return (
          basicFields.every((field) => {
            const control = this.signupForm.get(field);
            return control && control.valid;
          }) && !this.signupForm.errors?.['passwordMismatch']
        );
      case 'vendor':
        const requiredVendorFields = [
          'phoneNumber',
          'name',
          'contactPersonFirstName',
          'contactPersonLastName',
          'businessDescription',
        ];
        const requiredFieldsValid = requiredVendorFields.every((field) => {
          const control = this.signupForm.get(field);
          const value = control?.value;
          return (
            control && value && value.toString().trim() !== '' && control.valid
          );
        });
        return requiredFieldsValid;
      case 'location':
        const latitude = this.signupForm.get('latitude')?.value;
        const longitude = this.signupForm.get('longitude')?.value;
        const businessAddress = this.signupForm.get('businessAddress')?.value;
        return !!(latitude && longitude && businessAddress);
      default:
        return false;
    }
  }
  getSubmitButtonText(): string {
    switch (this.currentStep) {
      case 'basic':
        const roleName = this.signupForm.get('role')?.value;
        const isVendor = this.isVendorRole(roleName);
        return this.translate.instant(
          isVendor ? 'AUTH.CONTINUE' : 'AUTH.CREATE_ACCOUNT'
        );
      case 'vendor':
        return this.translate.instant('AUTH.CONTINUE');
      case 'location':
        return this.translate.instant('AUTH.CREATE_ACCOUNT');
      default:
        return this.translate.instant('AUTH.CONTINUE');
    }
  }
  goBackToBasicInfo(): void {
    this.currentStep = 'basic';
    this.clearErrorMessages();
  }
  goBackToVendorInfo(): void {
    this.currentStep = 'vendor';
    this.clearErrorMessages();
  }
  onSubmit(): void {
    if (!this.isFormValidForCurrentStep()) {
      this.markAllFieldsAsTouched();

      if (this.currentStep === 'location') {
        const latitude = this.signupForm.get('latitude')?.value;
        const longitude = this.signupForm.get('longitude')?.value;
        const businessAddress = this.signupForm.get('businessAddress')?.value;

        if (!latitude || !longitude || !businessAddress) {
          this.errorMessage =
            this.translate.instant('AUTH.LOCATION_REQUIRED_ERROR') ||
            'Please set your service area location before proceeding.';
        }
      }
      return;
    }
    const roleName = this.signupForm.get('role')?.value;
    const isVendor = this.isVendorRole(roleName);
    switch (this.currentStep) {
      case 'basic':
        if (isVendor) {
          this.currentStep = 'vendor';
        } else {
          this.createUserAccount();
        }
        break;
      case 'vendor':
        this.currentStep = 'location';
        break;
      case 'location':
        this.createUserAccount();
        break;
    }
  }
  private createUserAccount(): void {
    this.isLoading = true;
    this.clearErrorMessages();
    const formValue = this.signupForm.value;
    const isVendor = this.isVendorRole(formValue.role);
    const userRequest: UserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      role: formValue.role,
      password: formValue.password,
      phoneNumber: formValue.phoneNumber || '',
    };
    this.userService.createUser(userRequest).subscribe({
      next: (userResponse) => {
        if (isVendor && userResponse.id) {
          this.createCompanyDetails(userResponse.id, formValue);
        } else {
          this.handleSuccessfulRegistration();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      },
    });
  }
  private createCompanyDetails(
    userId: number,
    formValue: CompanyDetails
  ): void {
    const formData = new FormData();
    formData.append('UserId', userId.toString());
    formData.append('Name', formValue.name || '');
    formData.append('StreetAddress', formValue.businessAddress || '');
    formData.append('LongitudeAddress', formValue.longitude?.toString() || '');
    formData.append('LatitudeAddress', formValue.latitude?.toString() || '');
    formData.append(
      'OperatingRadius',
      formValue.operatingRadius?.toString() || ''
    );
    formData.append(
      'ContactPersonFirstName',
      formValue.contactPersonFirstName || ''
    );
    formData.append(
      'ContactPersonLastName',
      formValue.contactPersonLastName || ''
    );
    formData.append('ContactPersonEmail', formValue.contactEmail || '');
    formData.append('ContactPersonPhone', formValue.contactPhone || '');
    formData.append('Description', formValue.businessDescription || '');
    formData.append('CompanySize', formValue.companySize?.toString() || '1');
    if (this.selectedFile) {
      formData.append('Certificate', this.selectedFile, this.selectedFile.name);
    } else {
      formData.append('Certificate', '');
    }
    this.userService.createCompanyDetails(formData).subscribe({
      next: (response) => {
        if (
          this.currentStep === 'location' &&
          this.materialCategoriesComponent
        ) {
          this.saveCategoriesAndComplete();
        } else {
          this.handleSuccessfulRegistration();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
      },
    });
  }
  private saveCategoriesAndComplete(): void {
    try {
      const selectedData = this.materialCategoriesComponent.getSelectedData();
      if (
        selectedData.subcategoriesIds.length > 0 ||
        selectedData.categoriesIds.length > 0
      ) {
        console.log('Selected categories:', selectedData);
      }
      this.handleSuccessfulRegistration();
    } catch (error) {
      this.handleSuccessfulRegistration();
    }
  }
  private handleSuccessfulRegistration(): void {
    this.isLoading = false;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
    this.successMessage = this.translate.instant(
      'AUTH.ACCOUNT_CREATED_SUCCESS'
    );
    const roleName = this.signupForm.get('role')?.value;
    const isVendor = this.isVendorRole(roleName);

    if (!isVendor || this.currentStep === 'location') {
      setTimeout(() => this.navigateToLogin(), 2000);
    }
  }
  private handleError(error: any): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
    if (error.status === 400 && error.error?.errors) {
      const errorsObj = error.error.errors;
      const firstKey = Object.keys(errorsObj)[0];
      this.errorMessage = errorsObj[firstKey][0];
    } else if (error.status === 409) {
      this.errorMessage = this.translate.instant('AUTH.ERROR_EMAIL_EXISTS');
    } else if (error.status === 422) {
      this.errorMessage = this.translate.instant('AUTH.ERROR_CHECK_FIELDS');
    } else {
      this.errorMessage = this.translate.instant('AUTH.ERROR_GENERIC');
    }
  }
  private markAllFieldsAsTouched(): void {
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  private clearErrorMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  handleServiceAreaChange(data: {
    streetAddress: string;
    latitude: number;
    longitude: number;
    radius: number;
  }) {
    this.signupForm.patchValue({
      businessAddress: data.streetAddress,
      latitude: data.latitude,
      longitude: data.longitude,
      operatingRadius: data.radius,
    });
  }
}


