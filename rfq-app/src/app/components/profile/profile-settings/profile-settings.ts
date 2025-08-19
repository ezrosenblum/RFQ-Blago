import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
import { DocumentService } from '../../../services/document';
import { FilePondFile } from 'filepond';
@Component({
  standalone: false,
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  userForm: FormGroup;
  errors: ValidationErrors | null = null;
  isSubmitting: boolean = false;
  isFormChanged: boolean = false;

  selectedFile: File | null = null;
  accountExistingAvatar: string | null = null;
  previewImageUrl: string | null = null;

  selectedCertificate: File | null = null;
  existingCertificate: any = null;
  isDownloadingCertificate = false;
  selectedFileName: string | null = null;
  isDragOver: boolean = false;
  isUploadingCertificate: boolean = false;
  uploadProgress: number = 0;

  initialValues: any;
  companySizes: LookupValue[] = [];

  successMessage: string | null = null;
  errorMessage: string | null = null;

  pondOptions = {
    allowMultiple: false,
    maxFiles: 1,
    labelIdle: `
    `,
    acceptedFileTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxFileSize: '5MB',
    allowFileTypeValidation: true,
    allowFileSizeValidation: true,
    fileValidateTypeLabelExpectedTypes: 'Expects PDF, JPG, PNG, DOC, or DOCX',
    server: null,
    allowRevert: true,
    allowReorder: false,
    allowProcess: false,
    instantUpload: false,
    credits: false,
    className: 'certificate-filepond',
  };
  pondFiles: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: Auth,
    private translate: TranslateService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService,
    private documentService: DocumentService,
    private auth: Auth
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.subscribeToUserChanges();
    this.loadLookupData();
    this.userForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkIfFormChanged();
    });

    this.pondOptions = {
      ...this.pondOptions,
      labelIdle: `
      ${this.translate.instant('PROFILE.DRAG_DROP_CERTIFICATE')}
      <span class="filepond--label-action">
        ${this.translate.instant('PROFILE.BROWSE')}
      </span>
      <br>
      <small style="color:#666;">
        ${this.translate.instant('PROFILE.CLICK_EXISTING_TO_VIEW')}
      </small>
    `,
    };
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
      picture: [''],
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
      certificate: [null],
    });
  }

  onPhoneInput(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = PhoneNumberFormatter.formatUsPhone(input.value);
    this.userForm
      .get(fieldName)
      ?.setValue(formattedValue, { emitEvent: false });

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
  private populateForm(user: User): void {
    const companyDetails = user.companyDetails;
    this.existingCertificate = companyDetails?.certificate || null;

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      picture: user.picture,
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
      certificate: companyDetails?.certificate?.id || null,
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

  onPondActivateFile(event: Event): void {
    if (this.selectedCertificate) {
      this.documentService.openLocalFile(this.selectedCertificate);
      return;
    }

    const url = this.existingCertificate?.url;
    if (!url) {
      this.handleSubmissionError(
        this.translate.instant('PROFILE.DOCUMENT_NOT_AVAILABLE')
      );
      return;
    }

    this.isDownloadingCertificate = true;

    this.documentService
      .openRemote(url, {
        fileName: this.getCertificateName() ?? 'Document',
        token: this.auth.getToken() ?? undefined,
        withCredentials: false,
      })
      .pipe(finalize(() => (this.isDownloadingCertificate = false)))
      .subscribe({
        error: () =>
          this.handleSubmissionError(
            this.translate.instant('PROFILE.DOCUMENT_NOT_AVAILABLE')
          ),
      });
  }

  private initializeFilePondWithExistingFile(): void {
    if (this.existingCertificate?.url) {
      this.pondFiles = [
        {
          source: this.existingCertificate.url,
          options: {
            type: 'remote',
            file: {
              name: this.existingCertificate.name,
              size: this.existingCertificate.size ?? 0,
              type: this.getMimeType(this.existingCertificate.name),
            },
          },
        },
      ];
    } else {
      this.pondFiles = [];
    }
  }
  private initializeUserData(data: User): void {
    this.user = data;
    this.populateForm(data);
    this.previewImageUrl = data.picture || data.picture || null;
    this.accountExistingAvatar = this.previewImageUrl;
    this.initializeFilePondWithExistingFile();
  }

  private getMimeType(filename: string): string {
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  onFilePondAddFile({ file }: { file: FilePondFile }): void {
    if (file.file instanceof File) {
      this.processCertificateFile(file.file);
    }
  }

  onFilePondRemoveFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.alertService
      .confirm('PROFILE.CONFIRM_DELETE_CERTIFICATE', 'warning')
      .then(({ isConfirmed }) => {
        if (!isConfirmed) return;
        this.selectedCertificate = null;
        this.selectedFileName = null;
        this.checkIfFormChanged();
        this.translate.get('PROFILE.CERTIFICATE_REMOVED').subscribe((msg) => {
          this.successMessage = msg;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        });
      });
  }

  onFilePondError(event: Event): void {
    this.handleSubmissionError(
      this.translate.instant('PROFILE.FILE_UPLOAD_ERROR')
    );
  }
  onFileSelected(event: Event, fileType: FileType = 'avatar'): void {
    const file = this.getSelectedFile(event);
    if (!file) return;

    if (fileType === 'avatar') {
      this.handleAvatarSelection(file);
    } else if (fileType === 'certificate') {
      this.processCertificateFile(file);
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

  private processCertificateFile(file: File): void {
    this.errorMessage = null;
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = [
      '.pdf',
      '.jpg',
      '.jpeg',
      '.png',
      '.doc',
      '.docx',
    ];

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      this.handleSubmissionError(
        this.translate.instant('PROFILE.INVALID_FILE_TYPE')
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.handleSubmissionError(
        this.translate.instant('PROFILE.FILE_TOO_LARGE')
      );
      return;
    }

    this.existingCertificate = null;
    this.selectedCertificate = file;
    this.selectedFileName = file.name;
    this.checkIfFormChanged();
  }

  removeCertificate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedCertificate = null;
    this.existingCertificate = null;
    this.selectedFileName = null;
    this.errorMessage = null;
    this.pondFiles = [];
    this.userForm.patchValue({ certificate: null });
    this.checkIfFormChanged();
  }

  getCertificateName(): string {
    if (this.selectedCertificate) {
      return this.selectedCertificate.name;
    }
    if (this.existingCertificate) {
      return this.existingCertificate.name;
    }
    return '';
  }

  getFileType(): string {
    let fileName: string;

    if (this.selectedCertificate) {
      fileName = this.selectedCertificate.name;
    } else if (this.existingCertificate) {
      fileName = this.existingCertificate.name;
    } else {
      return 'document';
    }

    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf('.'));

    if (extension === '.pdf') {
      return 'pdf';
    } else if (['.jpg', '.jpeg', '.png'].includes(extension)) {
      return 'image';
    } else {
      return 'document';
    }
  }
  private generateImagePreview(file: File): void {
    const url = URL.createObjectURL(file);
    this.previewImageUrl = url;
    const reader = new FileReader();
    reader.onload = () => URL.revokeObjectURL(url);
    reader.readAsArrayBuffer(file);
  }

  onDeleteImage(): void {
    this.alertService
      .confirm('PROFILE.CONFIRM_DELETE_IMAGE', 'warning')
      .then(({ isConfirmed }) => {
        if (!isConfirmed) return;

        this.previewImageUrl = null;
        this.selectedFile = null;
        this.userForm.patchValue({ picture: null });
        this.checkIfFormChanged();
        this.translate.get('PROFILE.IMAGE_REMOVED').subscribe((msg) => {
          this.successMessage = msg;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        });
      });
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

  private handleSubmissionError(error: HttpErrorResponse | string): void {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const message = this.errorHandler.handleError(error);
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  discardChanges(): void {
    this.userForm.reset(this.initialValues);
    this.previewImageUrl = this.accountExistingAvatar;
    this.selectedFile = null;
    this.selectedCertificate = null;
    this.selectedFileName = null;
    this.errorMessage = null;

    this.userForm.patchValue({
      certificate: this.user?.companyDetails?.certificate?.id ?? null,
    });

    this.existingCertificate = this.user?.companyDetails?.certificate || null;
    this.pondFiles = [];
    setTimeout(() => {
      if (this.user) {
        this.initializeUserData(this.user);
      }
    }, 100);

    this.checkIfFormChanged();
  }
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

