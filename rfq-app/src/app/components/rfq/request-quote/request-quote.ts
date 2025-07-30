import { ActualFileObject, FilePondInitialFile } from 'filepond';
// src/app/rfq/request-quote/request-quote.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../../../models/user.model';
import { LookupValue, RfqRequest } from '../../../models/rfq.model';
import { Auth } from '../../../services/auth';
import { RfqService } from '../../../services/rfq';
import { FileItem } from '../../../models/form-validation';

@Component({
  selector: 'app-request-quote',
  standalone: false,
  templateUrl: './request-quote.html',
  styleUrls: ['./request-quote.scss']
})
export class RequestQuote implements OnInit, OnDestroy {
  rfqForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  currentUser: User | null = null;

  private destroy$ = new Subject<void>();

  // Unit options for dropdown
  unitOptions: LookupValue[] = [];

  pondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  };

  pondFiles: (string | FilePondInitialFile | Blob | ActualFileObject)[] = [];

  // Dummy data for file view component
  attachedFiles: FileItem[] = [
    {
      id: '1',
      name: 'document.pdf',
      size: 2048576,
      lastModified: new Date('2024-01-15'),
      type: 'application/pdf'
    },
    {
      id: '2',  
      name: 'image.png',
      size: 1024000,
      lastModified: new Date('2024-01-16'),
      type: 'image/png'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private rfqService: RfqService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;

        if (this.currentUser?.type === UserRole.CLIENT) {
           this.rfqService.getRfqUnits().pipe(takeUntil(this.destroy$)).subscribe({
            next: (units) => {
              this.unitOptions = units;
            },
            error: (error) => {
              console.error('Failed to load RFQ units:', error);
              this.errorMessage = 'Failed to load unit options. Please try again later.';
            }
          });
        }
      });

    // Auto-focus first field
    setTimeout(() => {
      const firstInput = document.getElementById('description');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.rfqForm = this.fb.group({
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
        this.noOnlyWhitespaceValidator
      ]],
      quantity: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(1000000),
        this.positiveNumberValidator
      ]],
      unit: ['', [Validators.required]],
      jobLocation: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        this.noOnlyWhitespaceValidator
      ]],
      attachments: [null]
    });

  }

  // Custom validator for positive numbers
  private positiveNumberValidator(control: any) {
    const value = control.value;
    if (value !== null && (isNaN(value) || value <= 0)) {
      return { positiveNumber: true };
    }
    return null;
  }

  // Custom validator to prevent only whitespace
  private noOnlyWhitespaceValidator(control: any) {
    const value = control.value;
    if (value && typeof value === 'string' && value.trim().length === 0) {
      return { onlyWhitespace: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.rfqForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const uploadedFiles = this.rfqForm.value.attachments;
      const rfqData: RfqRequest = {
        description: this.rfqForm.value.description.trim(),
        quantity: parseFloat(this.rfqForm.value.quantity),
        unit: Number(this.rfqForm.value.unit),
        jobLocation: this.rfqForm.value.jobLocation.trim(),
        attachments: uploadedFiles
      };

      this.rfqService.createRfq(rfqData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.successMessage = 'Your quote request has been submitted successfully! We will review it and get back to you soon.';
            this.resetForm();

            // Auto-scroll to success message
            setTimeout(() => {
              console.log(this.successMessage)
              const successElement = document.querySelector('.alert-success');
              if (successElement) {
                successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 1000);

            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.handleSubmissionError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
      this.scrollToFirstError();
    }
  }

  private handleSubmissionError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      this.authService.logout();
    } else if (error.status === 400) {
      this.errorMessage = 'Invalid data provided. Please check your inputs and try again.';
    } else if (error.status === 429) {
      this.errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.status === 0) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to submit request. Please try again.';
    }
  }

  private resetForm(): void {
    this.rfqForm.reset();
    this.rfqForm.patchValue({
      description: '',
      quantity: '',
      unit: '',
      jobLocation: ''
    });

    // Reset form state
    this.rfqForm.markAsUntouched();
    this.rfqForm.markAsPristine();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.rfqForm.controls).forEach(key => {
      const control = this.rfqForm.get(key);
      control?.markAsTouched();
    });
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstErrorField = document.querySelector('.border-error-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rfqForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.rfqForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} must be greater than ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['max'].max}`;
      if (field.errors['positiveNumber']) return `${this.getFieldDisplayName(fieldName)} must be a positive number`;
      if (field.errors['onlyWhitespace']) return `${this.getFieldDisplayName(fieldName)} cannot be only spaces`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      description: 'Description',
      quantity: 'Quantity',
      unit: 'Unit',
      jobLocation: 'Job Location'
    };
    return fieldNames[fieldName] || fieldName;
  }

  getCharacterCount(fieldName: string): number {
    const field = this.rfqForm.get(fieldName);
    return field?.value ? field.value.trim().length : 0;
  }

  getMaxLength(fieldName: string): number {
    const maxLengths: { [key: string]: number } = {
      description: 1000,
      jobLocation: 200
    };
    return maxLengths[fieldName] || 0;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToVendorRfqs(): void {
    this.router.navigate(['/vendor-rfqs']);
  }

  clearForm(): void {
    if (confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
      this.resetForm();
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  // Get form completion percentage
  getFormCompletionPercentage(): number {
    const totalFields = Object.keys(this.rfqForm.controls).length;
    let filledFields = 0;

    Object.keys(this.rfqForm.controls).forEach(key => {
      const control = this.rfqForm.get(key);
      if (control?.value && control.value.toString().trim()) {
        filledFields++;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  isFormPartiallyFilled(): boolean {
    return this.getFormCompletionPercentage() > 0 && this.getFormCompletionPercentage() < 100;
  }

  getUnitOptions() {
    return this.unitOptions;
  }

  getUnitDescription(): string {
    const selectedUnit = this.rfqForm.get('unit')?.value;
    const unitOption = this.unitOptions.find(option => option.id === selectedUnit);
    return unitOption?.name || '';
  }

  onFilesUpdated(files: (string| FilePondInitialFile | Blob | ActualFileObject)[]): void {
    this.pondFiles = files;

    const rawFiles: File[] = files
    .map(file => {
      if (typeof file === 'string') return null;
      if ('file' in file) return file.file as File;
      if (file instanceof Blob) return file as File;
      return null;
    })
    .filter((f): f is File => f !== null);

    this.rfqForm.get('attachments')?.setValue(rawFiles);
  }
}
