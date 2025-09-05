import { ActualFileObject, FilePondInitialFile } from 'filepond';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { User, UserRole } from '../../../models/user.model';
import { LookupValue } from '../../../models/rfq.model';
import { Auth } from '../../../services/auth';
import { RfqService } from '../../../services/rfq';
import { FileItem } from '../../../models/form-validation';
import { environment } from '../../../../environments/environment';
import * as FilePond from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { MaterialCategoriesSelectionComponent } from '../../profile/material-categories-selection/material-categories-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { FilePondComponent } from 'ngx-filepond';
import { AlertService } from '../../../services/alert.service';
import { QuillEditorComponent } from 'ngx-quill';

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
  clearData: Subject<boolean> = new Subject<boolean>();
  rfqId?: number;
  rfqCategoriesIds = new Set<number>();
  rfqSubcategoriesIds = new Set<number>();

  private isGoogleMapsLoaded = false;
  private autocomplete: any;
  public selectedPlace: any = null;
  @ViewChild('jobLocationInput', { static: false })
  jobLocationInput!: ElementRef;
  options: any;
  @ViewChild(MaterialCategoriesSelectionComponent)
  categoriesSelectionComp!: MaterialCategoriesSelectionComponent;
  @ViewChild('messageInput') messageInput!: QuillEditorComponent;
  toolbarOptions = [];

  modules = {
    toolbar: this.toolbarOptions
  };

  private destroy$ = new Subject<void>();

  unitOptions: LookupValue[] = [];

  pondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    labelIdle: '',
    beforeRemoveFile: async (file: any) => {
      const { isConfirmed } = await this.alertService.confirm(
        'ALERTS.CONFIRM_DELETE',
        'warning'
      );

      if (isConfirmed) {
        this.translate.get('ALERTS.DELETED_SUCCESSFULLY').subscribe(msg => {
          this.successMessage = msg;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        });
      }

      return isConfirmed;
    }
  };

  pondFiles: (string | FilePondInitialFile | Blob | ActualFileObject)[] = [];
  @ViewChild('myPond') myPond!: FilePondComponent;

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
    private translate: TranslateService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.rfqId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.rfqId) {
      this.rfqService.getRfqDetails(this.rfqId).pipe(take(1)).subscribe({
        next: (result) => {
          if (result) {
            console.log(result);
            this.rfqForm.patchValue({
              title: result.title,
              description: result.description,
              quantity: result.quantity,
              unit: result.unit?.id,
              jobLocation: result.jobLocation,
              latitude: result.latitudeAddress,
              longitude: result.longitudeAddress,
              streetAddress: result.streetAddress
            });
            this.rfqCategoriesIds = new Set(result.categories?.map(c => c.id));
            this.rfqSubcategoriesIds = new Set(result.subcategories?.map(s => s.id));

            this.pondFiles = result.media?.items.map(item => ({
              source: item.url,
              options: {
                type: 'local',
                file: {
                  name: item.name,
                  size: item.size,
                  type: 'application/pdf'
                },
                metadata: {
                  id: item.id
                }
              }
            })) || [];
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
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
        if ((this.currentUser?.type == 'Administrator' && !this.rfqId) || this.currentUser?.type == 'Vendor') {
          this.router.navigate(['/vendor-rfqs']);
        }
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
    this.clearData.complete();
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
          Validators.maxLength(5000),
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

      let request$: Observable<boolean | null>;

      if (this.rfqId) {
        const updatePayload = {
          title: this.rfqForm.value.title || '',
          description: this.rfqForm.value.description || '',
          quantity: this.rfqForm.value.quantity || 0,
          unit: this.rfqForm.get('unit')?.value || 0,
          jobLocation: this.rfqForm.value.jobLocation || '',
          streetAddress: this.rfqForm.value.streetAddress || '',
          latitudeAddress: this.rfqForm.value.latitude || 0,
          longitudeAddress: this.rfqForm.value.longitude || 0,
          categoriesIds: selection.categoriesIds,
          subcategoriesIds: selection.subcategoriesIds
        };

        request$ = this.rfqService.updateRfq(this.rfqId, updatePayload);

      } else {
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
        rfqFormData.append('Description', this.rfqForm.value.description || '');
        rfqFormData.append('Quantity', this.rfqForm.value.quantity?.toString() || '0');
        rfqFormData.append('Unit', this.rfqForm.get('unit')?.value || 0);
        rfqFormData.append('JobLocation', this.rfqForm.value.jobLocation || '');
        rfqFormData.append('StreetAddress', this.rfqForm.value.streetAddress || '');
        rfqFormData.append('LatitudeAddress', this.rfqForm.value.latitude?.toString() || '0');
        rfqFormData.append('LongitudeAddress', this.rfqForm.value.longitude?.toString() || '0');

        request$ = this.rfqService.createRfq(rfqFormData);
      }
      request$.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.alertService.success('VENDOR.SUBMIT_SUCCESS');
          this.resetForm();

          setTimeout(() => {
            const successElement = document.querySelector('.alert-success');
            if (successElement) {
              successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 1000);

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
          this.router.navigate(['/vendor-rfqs']);
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

    this.pondFiles = [];
    this.clearData.next(true);
    this.successMessage = '';
    this.errorMessage = '';
    this.clearData.next(false);
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
      description: 5000,
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
      this.pondFiles = [];
      this.clearData.next(true);
      this.resetForm();
      this.successMessage = '';
      this.errorMessage = '';
      this.clearData.next(false);
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

  pondHandleAddFile(event: any) {
    if (this.rfqId) {
      this.rfqService.addFileToRfq(this.rfqId, event.file.file).subscribe({
        next: (res: any) => {
          if (res) {
            event.file.setMetadata('id', res);
          }
          this.alertService.success(this.translate.instant('REQUEST.FILE_UPLOADED'));
        },
        error: () => this.alertService.error(this.translate.instant('REQUEST.FILE_UPLOAD_FAILED'))
      });
    } else {
      this.pondFiles.push(event.file.file as File);
    }
  }

  onFileRemoved(event: any) {
    const file = event.file;
    const fileId = file.getMetadata('id');
    if (fileId) {
      this.rfqService.deleteFileFromRfq(this.rfqId!, fileId).subscribe({
        next: () => this.alertService.success(this.translate.instant('REQUEST.FILE_DELETED')),
        error: () => this.alertService.error(this.translate.instant('REQUEST.FILE_DELETE_FAILED'))
      });
    }
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
