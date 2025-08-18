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
import { usPhoneValidator } from '../../../shared/validators/phone.validators';
import { PhoneNumberFormatter } from '../../../shared/utils/phone-formatter.util';
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

  isSubmitting: boolean = false;
  isFormChanged: boolean = false;

  selectedFile: File | null = null;
  selectedCertificate: File | null = null;

  accountExistingAvatar: string | null = null;
  selectedFileName: string | null = null;

  initialValues: any;

  companySizes: LookupValue[] = [];

  previewImageUrl: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  isDragOver: boolean = false;

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
    this.userForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkIfFormChanged();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phoneNumber: ['', [usPhoneValidator()]],
      profilePicture: [''],
      companyName: [''],
      contactPersonFirstName: [''],
      contactPersonLastName: [''],
      contactPersonEmail: ['', Validators.email],
      contactPersonPhone: ['', [usPhoneValidator()]],
      businessDescription: [''],
      businessAddress: [''],
      latitudeAddress: [null],
      longitudeAddress: [null],
      operatingRadius: [null],
      companySize: [null],
      certificateUrl: [null],
    });
  }

  onPhoneInput(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = PhoneNumberFormatter.formatUsPhone(input.value);

    // Update the form control
    this.userForm
      .get(fieldName)
      ?.setValue(formattedValue, { emitEvent: false });

    // Update the input display
    input.value = formattedValue;
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
      certificateUrl: companyDetails?.certificateUrl || null,
    });
    this.initialValues = this.userForm.getRawValue();
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

  checkIfFormChanged(): void {
    const currentValues = this.userForm.getRawValue();
    const formChanged = !this.isEqual(this.initialValues, currentValues);

    const avatarChanged = !!this.selectedFile;
    const certificateChanged = !!this.selectedCertificate;

    this.isFormChanged = formChanged || avatarChanged || certificateChanged;
  }
  isEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  onFileSelected(event: Event, fileType: FileType = 'avatar'): void {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    if (fileType === 'avatar') {
      this.handleAvatarSelection(file);
    } else if (fileType === 'certificate') {
      this.handleCertificateFileSelection(file);
    }
    this.checkIfFormChanged();
  }

  private getSelectedFile(event: Event): File | null {
    const fileInput = event.target as HTMLInputElement;
    return fileInput.files?.[0] || null;
  }

  private handleAvatarSelection(file: File): void {
    this.selectedFile = file;
    this.generateImagePreview(file);
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
    this.userForm.patchValue({ profilePicture: null });
    this.checkIfFormChanged();
  }

  onImageLoadError(): void {
    this.previewImageUrl = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleCertificateFileSelection(file);
    }
  }

  private handleCertificateFileSelection(file: File): void {
    this.errorMessage = null;

    if (!this.validateCertificateFile(file)) {
      return;
    }

    this.selectedCertificate = file;
    this.selectedFileName = file.name;
    this.checkIfFormChanged();
  }
  private validateCertificateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      this.errorMessage = this.translate.instant('PROFILE.FILE_TOO_LARGE');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = this.translate.instant('PROFILE.INVALID_FILE_TYPE');
      return false;
    }

    return true;
  }
  onRemoveCertificate(event: Event): void {
    event.stopPropagation();

    this.selectedCertificate = null;
    this.selectedFileName = null;
    this.errorMessage = null;

    this.userForm.get('certificateUrl')?.setValue(null);

    const fileInput = document.querySelector(
      'input[type="file"][formControlName="certificateUrl"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.checkIfFormChanged();
  }

  getFileType(filename: string): 'pdf' | 'doc' | 'image' {
    const ext = filename.toLowerCase().split('.').pop();

    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'doc';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return 'image';

    return 'doc';
  }

  getFileSize(file: File): string {
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    if (this.selectedCertificate) {
      formData.append('CompanyDetails.Certificate', this.selectedCertificate);
    }
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
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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

  discardChanges(): void {
    this.userForm.reset(this.initialValues);
    this.previewImageUrl = this.accountExistingAvatar;
    this.selectedFile = null;

    const fileInputElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.value = '';
    }

    this.checkIfFormChanged();
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

    if (errors['usPhone']) {
      return this.translate.instant('PROFILE.INVALID_US_PHONE_FORMAT');
    }

    return '';
  }
}
