import { Component, Input, OnInit } from '@angular/core';
import { FileType, LookupValue, User } from '../../../models/user.model';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Auth } from '../../../services/auth';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../services/alert.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  standalone: false,
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettingsComponent implements OnInit {
  @Input() user: User | null = null;

  userForm: FormGroup;
  errors: ValidationErrors | null = null;

  isSubmitting = false;
  initialUserData: User | null = null;

  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  selectedCertificate: File | null = null;
  selectedFileName: string | null = null;

  companySizes: LookupValue[] = [];

  successMessage: string | null = null;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: Auth,
    private translate: TranslateService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.subscribeToUserChanges();
    this.loadLookupData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [null, [Validators.minLength(9)]],
      profilePicture: [''],
      companyName: [''],
      contactPersonFirstName: [''],
      contactPersonLastName: [''],
      contactPersonEmail: ['', Validators.email],
      contactPersonPhone: [''],
      businessDescription: [''],
      businessAddress: [''],
      latitudeAddress: [null],
      longitudeAddress: [null],
      operatingRadius: [null],
      companySize: [null],
      certificate: [null],
    });
  }

  private subscribeToUserChanges(): void {
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.initializeUserData(data);
        }
      });
  }

  private initializeUserData(data: User): void {
    this.user = data;
    this.initialUserData = { ...data };
    this.populateForm(data);
    this.previewImageUrl = data.picture || data.profilePicture || null;
  }

  private populateForm(user: User): void {
    const companyDetails = user.companyDetails;

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      companyName: companyDetails?.name,
      contactPersonFirstName: companyDetails?.contactPersonFirstName,
      contactPersonLastName: companyDetails?.contactPersonLastName,
      contactPersonEmail: companyDetails?.contactPersonEmail,
      contactPersonPhone: companyDetails?.contactPersonPhone,
      businessDescription: companyDetails?.description,
      businessAddress: companyDetails?.streetAddress,
      latitudeAddress: companyDetails?.latitudeAddress,
      longitudeAddress: companyDetails?.longitudeAddress,
      operatingRadius: companyDetails?.operatingRadius,
      companySize: companyDetails?.companySize?.id || null,
      certificate: companyDetails?.certificateUrl || null,
    });
  }

  private loadLookupData(): void {
    this.userService
      .getCompanySizes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sizes) => (this.companySizes = sizes),
        error: () => (this.companySizes = []),
      });
  }

  onFileSelected(event: Event, fileType: FileType = 'avatar'): void {
    const file = this.getSelectedFile(event);
    if (!file) return;

    if (fileType === 'avatar') {
      this.handleAvatarSelection(file);
    } else if (fileType === 'certificate') {
      this.handleCertificateSelection(file);
    }
  }

  private getSelectedFile(event: Event): File | null {
    const fileInput = event.target as HTMLInputElement;
    return fileInput.files?.[0] || null;
  }

  private handleAvatarSelection(file: File): void {
    this.selectedFile = file;
    this.generateImagePreview(file);
  }

  private handleCertificateSelection(file: File): void {
    this.selectedCertificate = file;
    this.selectedFileName = file.name;
  }

  private generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onDeleteImage(): void {
    this.previewImageUrl = null;
    this.selectedFile = null;
  }

  onImageLoadError(): void {
    this.previewImageUrl = null;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.alertService.confirm('ALERTS.CONFIRM_SAVE').then((result) => {
      if (result.isConfirmed) {
        this.processFormSubmission();
      }
    });
  }

  private isFormValid(): boolean {
    if (this.userForm.valid) {
      return true;
    }

    this.userForm.markAllAsTouched();
    return false;
  }

  private processFormSubmission(): void {
    this.isSubmitting = true;

    if (this.selectedFile) {
      this.uploadProfilePictureAndSubmit();
    } else {
      this.submitProfile();
    }
  }

  private uploadProfilePictureAndSubmit(): void {
    this.userService
      .uploadProfilePicture(this.selectedFile!)
      .pipe(
        finalize(() => (this.isSubmitting = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.submitProfile(),
        error: (err) => this.handleSubmissionError(err),
      });
  }

  private submitProfile(): void {
    const formData = this.buildFormData();

    this.userService
      .updateUserProfile(formData)
      .pipe(
        finalize(() => (this.isSubmitting = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.handleSubmissionSuccess(),
        error: (err) => this.handleSubmissionError(err),
      });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    this.appendFormField(formData, 'FirstName', 'firstName');
    this.appendFormField(formData, 'LastName', 'lastName');
    this.appendFormField(formData, 'Email', 'email');
    this.appendPhoneNumber(formData);
    if (this.isVendorUser()) {
      this.appendCompanyFields(formData);
    }

    return formData;
  }

  private appendFormField(
    formData: FormData,
    key: string,
    formField: string
  ): void {
    const value = this.userForm.get(formField)?.value || '';
    formData.append(key, value);
  }

  private appendPhoneNumber(formData: FormData): void {
    const phone = this.userForm.get('phoneNumber')?.value;
    const phoneValue =
      typeof phone === 'string' ? phone : phone?.internationalNumber || '';
    formData.append('PhoneNumber', phoneValue);
  }

  private isVendorUser(): boolean {
    return this.user?.type?.toLowerCase() === 'vendor';
  }

  private appendCompanyFields(formData: FormData): void {
    const companyFields = [
      { key: 'CompanyDetails.Name', field: 'companyName' },
      {
        key: 'CompanyDetails.ContactPersonFirstName',
        field: 'contactPersonFirstName',
      },
      {
        key: 'CompanyDetails.ContactPersonLastName',
        field: 'contactPersonLastName',
      },
      { key: 'CompanyDetails.ContactPersonEmail', field: 'contactPersonEmail' },
      { key: 'CompanyDetails.ContactPersonPhone', field: 'contactPersonPhone' },
      { key: 'CompanyDetails.Description', field: 'businessDescription' },
      { key: 'CompanyDetails.StreetAddress', field: 'businessAddress' },
      { key: 'CompanyDetails.LatitudeAddress', field: 'latitudeAddress' },
      { key: 'CompanyDetails.LongitudeAddress', field: 'longitudeAddress' },
      { key: 'CompanyDetails.OperatingRadius', field: 'operatingRadius' },
      { key: 'CompanyDetails.CompanySize', field: 'companySize' },
    ];

    companyFields.forEach(({ key, field }) => {
      const value = this.userForm.get(field)?.value;
      if (value != null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    if (this.selectedCertificate) {
      formData.append('CompanyDetails.Certificate', this.selectedCertificate);
    }
  }

  private handleSubmissionSuccess(): void {
    this.userForm.markAsPristine();
    this.resetFileSelections();

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.translate.get('ALERTS.PROFILE_UPDATED').subscribe((msg) => {
      this.successMessage = msg;

      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    });
  }
  private handleSubmissionError(error: HttpErrorResponse): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);

    const message = this.errorHandler.handleError(error);
    this.errorMessage = message;

    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  private resetFileSelections(): void {
    this.selectedFile = null;
    this.selectedCertificate = null;
    this.selectedFileName = null;
  }

  // Form state management
  hasChanges(): boolean {
    const currentProfilePic =
      this.initialUserData?.profilePicture || this.initialUserData?.picture;

    return (
      this.userForm.dirty ||
      this.previewImageUrl !== currentProfilePic ||
      this.selectedCertificate !== null
    );
  }

  discardChanges(): void {
    if (!this.initialUserData) return;

    this.userForm.reset();
    this.initializeUserData(this.initialUserData);
    this.resetFileSelections();
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (!field?.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;
    const upperFieldName = fieldName.toUpperCase();

    if (errors['required']) {
      return this.translate.instant(`PROFILE.${upperFieldName}_REQUIRED`);
    }

    if (errors['email']) {
      return this.translate.instant('PROFILE.ENTER_EMAIL_VALIDATION');
    }

    if (errors['minlength']) {
      return this.translate.instant('PROFILE.PHONE_TOO_SHORT');
    }

    if (errors['maxlength']) {
      return this.translate.instant('PROFILE.FIELD_TOO_LONG', {
        field: this.translate.instant(`PROFILE.${upperFieldName}`),
        max: errors['maxlength'].requiredLength,
      });
    }

    if (errors['pattern']) {
      return this.translate.instant('PROFILE.INVALID_PHONE_FORMAT');
    }

    return '';
  }
}
