import { ActualFileObject, FilePondInitialFile } from 'filepond';
// src/app/rfq/request-quote/request-quote.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../../../models/user.model';
import {
  GoogleMapsApi,
  LookupValue,
  RfqRequest,
} from '../../../models/rfq.model';
import { Auth } from '../../../services/auth';
import { RfqService } from '../../../services/rfq';
import { FileItem } from '../../../models/form-validation';
import { environment } from '../../../../environments/environment';
import * as FilePond from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { MaterialCategoriesSelectionComponent } from '../../profile/material-categories-selection/material-categories-selection.component';
import { TranslateService } from '@ngx-translate/core';

FilePond.registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

@Component({
  selector: 'app-request-quote',
  standalone: false,
  templateUrl: './request-quote.html',
  styleUrls: ['./request-quote.scss'],
})
export class RequestQuote implements OnInit, OnDestroy {
  rfqForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  currentUser: User | null = null;
  selectedLocation: string = '';

  private isGoogleMapsLoaded = false;
  private autocomplete: any;
  public selectedPlace: any = null;
  @ViewChild('jobLocationInput', { static: false })
  jobLocationInput!: ElementRef;
  options: any;
  @ViewChild(MaterialCategoriesSelectionComponent)
  categoriesSelectionComp!: MaterialCategoriesSelectionComponent;

  private destroy$ = new Subject<void>();

  unitOptions: LookupValue[] = [];

  pondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    labelIdle: '',
  };

  pondFiles: (string | FilePondInitialFile | Blob | ActualFileObject)[] = [];

  attachedFiles: FileItem[] = [
    {
      id: '1',
      name: 'document.pdf',
      size: 2048576,
      lastModified: new Date('2024-01-15'),
      type: 'application/pdf',
    },
    {
      id: '2',
      name: 'image.png',
      size: 1024000,
      lastModified: new Date('2024-01-16'),
      type: 'image/png',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private rfqService: RfqService,
    private router: Router,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setLabelIdleTranslations();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setLabelIdleTranslations());
  }

  private setLabelIdleTranslations(): void {
    this.pondOptions.labelIdle = this.translate.instant('VENDOR.LABEL_IDLE');
  }

  ngAfterViewInit(): void {
    this.loadGoogleMapsAPI()
      .then(() => {
        this.isGoogleMapsLoaded = true;
        this.initializeOptions();
        this.initializeAutocomplete();
      })
      .catch(() => {
        this.errorMessage = this.translate.instant('VENDOR.LOAD_GOOGLE_MAPS');
      });
  }

  loadData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        if (this.currentUser?.type === UserRole.CLIENT) {
          this.rfqService
            .getRfqUnits()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (units) => {
                this.unitOptions = units;
              },
              error: () => {
                this.errorMessage = this.translate.instant('VENDOR.LOAD_UNITS');
              },
            });
        }
      });

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
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
          this.noOnlyWhitespaceValidator,
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(1000000),
          this.positiveNumberValidator,
        ],
      ],
      unit: ['', [Validators.required]],
      jobLocation: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
          this.noOnlyWhitespaceValidator,
        ],
      ],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      latitude: [null],
      longitude: [null],
      attachments: [null],
    });
  }

  private positiveNumberValidator(control: any) {
    const value = control.value;
    if (value !== null && (isNaN(value) || value <= 0)) {
      return { positiveNumber: true };
    }
    return null;
  }

  private noOnlyWhitespaceValidator(control: any) {
    const value = control.value;
    if (value && typeof value === 'string' && value.trim().length === 0) {
      return { onlyWhitespace: true };
    }
    return null;
  }

  onSubmit(): void {
    const selection = this.categoriesSelectionComp.getSelectedData();
    if (this.rfqForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const rfqFormData: FormData = new FormData();
      this.pondFiles.forEach((fileItem: any) => {
        let file: File | Blob;

        if (fileItem.file) {
          file = fileItem.file;
        } else if (fileItem instanceof File || fileItem instanceof Blob) {
          file = fileItem;
        } else {
          return;
        }

        rfqFormData.append('files', file, (file as File).name);
      });

      selection.categoriesIds.forEach((id: number, index) => {
        rfqFormData.append(`CategoriesIds[${index}]`, id.toString());
      });

      selection.subcategoriesIds.forEach((id: number, index) => {
        rfqFormData.append(`SubcategoriesIds[${index}]`, id.toString());
      });

      rfqFormData.append('Title', this.rfqForm.value.title || '');
      rfqFormData.append(
        'Description',
        `${this.rfqForm.value.description}` || ''
      );
      rfqFormData.append(
        'Quantity',
        `${this.rfqForm.value.quantity?.toString()}` || '0'
      );
      rfqFormData.append('Unit', this.rfqForm.get('unit')?.value || 0);
      rfqFormData.append('JobLocation', this.rfqForm.value.jobLocation || '');
      rfqFormData.append(
        'StreetAddress',
        `${this.rfqForm.value.jobLocation}` || ''
      );
      rfqFormData.append(
        'LatitudeAddress',
        this.rfqForm.value.latitude?.toString() || '0'
      );
      rfqFormData.append(
        'LongitudeAddress',
        this.rfqForm.value.longitude?.toString() || '0'
      );

      this.rfqService
        .createRfq(rfqFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.successMessage = this.translate.instant(
              'VENDOR.SUBMIT_SUCCESS'
            );

            this.resetForm();

            setTimeout(() => {
              const successElement = document.querySelector('.alert-success');
              if (successElement) {
                successElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }
            }, 1000);

            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.handleSubmissionError(error);
          },
        });
    } else {
      this.markFormGroupTouched();
      this.scrollToFirstError();
    }
  }

  private handleSubmissionError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = this.translate.instant('ERROR.SESSION_EXPIRED');
      this.authService.logout();
    } else if (error.status === 400) {
      this.errorMessage = this.translate.instant('ERROR.INVALID_DATA');
    } else if (error.status === 429) {
      this.errorMessage = this.translate.instant('ERROR.TOO_MANY_REQUESTS');
    } else if (error.status === 0) {
      this.errorMessage = this.translate.instant('ERROR.NO_CONNECTION');
    } else {
      this.errorMessage =
        error.error?.message ||
        this.translate.instant('ERROR.SUBMISSION_FAILED');
    }
  }

  private resetForm(): void {
    this.rfqForm.reset();
    this.rfqForm.patchValue({
      description: '',
      quantity: '',
      unit: '',
      jobLocation: '',
      title: '',
      latitude: '',
      longitude: '',
      streetAddress: '',
    });

    this.rfqForm.markAsUntouched();
    this.rfqForm.markAsPristine();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.rfqForm.controls).forEach((key) => {
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rfqForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.rfqForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required'])
        return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['minlength'])
        return `${this.getFieldDisplayName(fieldName)} must be at least ${
          field.errors['minlength'].requiredLength
        } characters`;
      if (field.errors['maxlength'])
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${
          field.errors['maxlength'].requiredLength
        } characters`;
      if (field.errors['min'])
        return `${this.getFieldDisplayName(fieldName)} must be greater than ${
          field.errors['min'].min
        }`;
      if (field.errors['max'])
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${
          field.errors['max'].max
        }`;
      if (field.errors['positiveNumber'])
        return `${this.getFieldDisplayName(
          fieldName
        )} must be a positive number`;
      if (field.errors['onlyWhitespace'])
        return `${this.getFieldDisplayName(fieldName)} cannot be only spaces`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      description: 'Description',
      quantity: 'Quantity',
      unit: 'Unit',
      jobLocation: 'Job Location',
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
      jobLocation: 200,
      title: 100,
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
    if (
      confirm(
        'Are you sure you want to clear all fields? This action cannot be undone.'
      )
    ) {
      this.resetForm();
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  getFormCompletionPercentage(): number {
    const totalFields = Object.keys(this.rfqForm.controls).length;
    let filledFields = 0;

    Object.keys(this.rfqForm.controls).forEach((key) => {
      const control = this.rfqForm.get(key);
      if (control?.value && control.value.toString().trim()) {
        filledFields++;
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  isFormPartiallyFilled(): boolean {
    return (
      this.getFormCompletionPercentage() > 0 &&
      this.getFormCompletionPercentage() < 100
    );
  }

  getUnitOptions() {
    return this.unitOptions;
  }

  getUnitDescription(): string {
    const selectedUnit = this.rfqForm.get('unit')?.value;
    const unitOption = this.unitOptions.find(
      (option) => option.id === selectedUnit
    );
    return unitOption?.name || '';
  }

  onFilesUpdated(files: any): void {
    if (!files || !Array.isArray(files)) {
      this.pondFiles = [];
      this.rfqForm.get('attachments')?.setValue([]);
      return;
    }

    this.pondFiles = files;

    const rawFiles = files
      .map((f) => {
        if (typeof f === 'string') return null;
        if ('file' in f) return f.file as File;
        if (f instanceof Blob) return f as File;
        return null;
      })
      .filter((f): f is File => f !== null);

    this.rfqForm.get('attachments')?.setValue(rawFiles);
  }

  private loadGoogleMapsAPI(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        resolve(google);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(google));
        existingScript.addEventListener('error', reject);
        return;
      }

      (window as any).initMap = () => {
        resolve(google);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private initializeAutocomplete() {
    if (
      !this.isGoogleMapsLoaded ||
      typeof google === 'undefined' ||
      !google.maps ||
      !google.maps.places
    )
      return;

    if (!this.jobLocationInput?.nativeElement) return;

    const input = this.jobLocationInput.nativeElement;

    let options: google.maps.places.AutocompleteOptions = {
      fields: [
        'place_id',
        'formatted_address',
        'name',
        'geometry.location',
        'address_components',
      ],
    };

    this.autocomplete = new google.maps.places.Autocomplete(input, options);

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = this.autocomplete.getPlace();
        this.onPlaceSelected(place);
      });
    });
  }

  public isGoogleMapsReady(): boolean {
    return Boolean(
      this.isGoogleMapsLoaded &&
        typeof google !== 'undefined' &&
        google.maps &&
        google.maps.places
    );
  }

  private initializeOptions(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.options = {
        types: [
          'address',
          'establishment',
          'geocode',
          'postal_code',
          '(cities)',
          '(regions)',
        ],
        fields: [
          'place_id',
          'formatted_address',
          'name',
          'geometry.location',
          'address_components',
          'types',
          'vicinity',
        ],
      };
    }
  }

  private onPlaceSelected(place: google.maps.places.PlaceResult) {
    if (!place.geometry) {
      return;
    }

    const addressComponents = place.address_components || [];
    const city =
      addressComponents.find((c) => c.types.includes('locality'))?.long_name ||
      '';
    const state =
      addressComponents.find((c) =>
        c.types.includes('administrative_area_level_1')
      )?.long_name || '';
    const postalCode =
      addressComponents.find((c) => c.types.includes('postal_code'))
        ?.long_name || '';
    const country =
      addressComponents.find((c) => c.types.includes('country'))?.long_name ||
      '';

    this.rfqForm.patchValue({
      jobLocation: place.formatted_address,
      latitude: place.geometry.location?.lat(),
      longitude: place.geometry.location?.lng(),
    });
  }
}
