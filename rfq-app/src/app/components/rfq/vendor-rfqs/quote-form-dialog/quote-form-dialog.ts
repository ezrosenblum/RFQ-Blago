import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RfqService } from '../../../../services/rfq';
import { LookupValue } from '../../../../models/user.model';
import { AlertService } from '../../../../services/alert.service';
import { CurrencyPipe } from '@angular/common';
import { FilePondComponent } from 'ngx-filepond';

@Component({
  selector: 'app-quote-form-dialog',
  standalone: false,
  templateUrl: './quote-form-dialog.html',
  styleUrl: './quote-form-dialog.scss'
})
export class QuoteFormDialog implements OnInit {

  action: string = 'Add';
  quoteForm!: FormGroup;
  isSubmitting = false;
  customerId: number | null = null;
  vendorId: number | null = null;
  rfqId: number | null = null;
  validityTypeOptions: LookupValue[] = [];
  @ViewChild('priceInput') priceInput!: ElementRef<HTMLInputElement>;
  pondFiles: File[] = [];
  pondOptions = {
      allowMultiple: true,
      maxFiles: 5,
      labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  };
  @ViewChild('myPond') myPond!: FilePondComponent;
  uploadedFilesCount = 0;
  
  constructor(
    private _dialogRef: MatDialogRef<QuoteFormDialog>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private formBuilder: FormBuilder,
    private rfqService: RfqService,
    private alertService: AlertService,
    private currencyPipe: CurrencyPipe
  ){
    if (this._data) {
      this.action = this._data.action || 'Add';
      this.customerId = this._data.customerId || null;
      this.vendorId = this._data.vendorId || null;
      this.rfqId = this._data.rfqId || null;
    }

    this.quoteForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.rfqService.getRfqQuoteValidityType().subscribe({
      next: (response) => {
        this.validityTypeOptions = response;
        // if (this._data && this._data.quote) {
        //   this.quoteForm.patchValue(this._data.quote);
        // }
      },
      error: (error) => {
        console.error('Error fetching validity types:', error);
      }
    })
  }

  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      quoteValidityInterval: [0, [Validators.required, Validators.min(1)]],
      quoteValidityIntervalType: [null, [Validators.required]],
      warantyDuration: [0, [Validators.required, Validators.min(1)]],
      warantyIntervalType: [null, [Validators.required]],
      timelineIntervalType: [null, [Validators.required]],
      minimumTimelineDuration: [0, [Validators.required, Validators.min(0)]],
      maximumTimelineDuration: [0, [Validators.required, Validators.min(0)]],
      vendorId: [],
      submissionId: []
    },
    {
      validators: this.timelineMinMaxValidator()
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // onSubmit(): void {
  //   if (this.quoteForm.valid) {
  //     this.isSubmitting = true;
  //     const formData = this.quoteForm.value;
  //     formData.vendorId = this.vendorId;
  //     formData.submissionId = this.rfqId;
  //     this.rfqService.saveQuote(formData).subscribe({
  //       next: (response) => {
  //         if (this.action === 'Add') {
  //           this.alertService.success('VENDOR.QUOTE_SUBMITTED_SUCCESS');
  //         } else {
  //           this.alertService.success('VENDOR.QUOTE_UPDATED_SUCCESS');
  //         }

  //         this.isSubmitting = false;
  //         setTimeout(() => {
  //           this._dialogRef.close(formData);
  //         }, 500);
  //       },
  //       error: (error) => {
  //         this.alertService.error(error.error.detail || 'VENDOR.QUOTE_SUBMISSION_FAILED');
  //         this.isSubmitting = false;
  //       }
  //     });
  //   } else {
  //     Object.keys(this.quoteForm.controls).forEach(key => {
  //       this.quoteForm.get(key)?.markAsTouched();
  //     });
  //   }
  // }

  onSubmit(): void {
  if (this.quoteForm.valid) {
    this.isSubmitting = true;
    
    // Create FormData object
    const formData = new FormData();
    
    // Get form values
    const formValues = this.quoteForm.value;
    
    // Append form fields to FormData
    formData.append('title', formValues.title || '');
    formData.append('description', formValues.description || '');
    formData.append('price', String(formValues.price || 0));
    formData.append('quoteValidityInterval', String(formValues.quoteValidityInterval || 0));
    formData.append('quoteValidityIntervalType', String(formValues.quoteValidityIntervalType || ''));
    formData.append('warantyDuration', String(formValues.warantyDuration || 0));
    formData.append('warantyIntervalType', String(formValues.warantyIntervalType || ''));
    formData.append('timelineIntervalType', String(formValues.timelineIntervalType || ''));
    formData.append('minimumTimelineDuration', String(formValues.minimumTimelineDuration || 0));
    formData.append('maximumTimelineDuration', String(formValues.maximumTimelineDuration || 0));
    formData.append('vendorId', String(this.vendorId || ''));
    formData.append('submissionId', String(this.rfqId || ''));
    
    // Append files to FormData
    this.pondFiles.forEach(file => {
      formData.append('Files', file, file.name);
    });

    this.rfqService.saveQuote(formData).subscribe({
      next: (response) => {
        if (this.action === 'Add') {
          this.alertService.success('VENDOR.QUOTE_SUBMITTED_SUCCESS');
        } else {
          this.alertService.success('VENDOR.QUOTE_UPDATED_SUCCESS');
        }

        this.isSubmitting = false;
        
        this.pondFiles = [];
        this.uploadedFilesCount = 0;
        setTimeout(() => {
          this._dialogRef.close(response);
        }, 500);
      },
      error: (error) => {
        this.alertService.error(error.error.detail || 'VENDOR.QUOTE_SUBMISSION_FAILED');
        this.isSubmitting = false;
      }
    });
  } else {
    Object.keys(this.quoteForm.controls).forEach(key => {
      this.quoteForm.get(key)?.markAsTouched();
    });
  }
}

  private timelineMinMaxValidator() {
  return (formGroup: FormGroup) => {
    const min = formGroup.get('minimumTimelineDuration')?.value;
    const max = formGroup.get('maximumTimelineDuration')?.value;

    if (min != null && max != null && min > max) {
      formGroup.get('minimumTimelineDuration')?.setErrors({ minGreater: true });
    } else {
      if (formGroup.get('minimumTimelineDuration')?.hasError('minGreater')) {
        const errors = { ...formGroup.get('minimumTimelineDuration')?.errors };
        delete errors['minGreater'];
        if (Object.keys(errors).length === 0) {
          formGroup.get('minimumTimelineDuration')?.setErrors(null);
        } else {
          formGroup.get('minimumTimelineDuration')?.setErrors(errors);
        }
      }
    }
    return null;
  };
  }

  onBlurPrice() {
    const rawValue = this.priceInput.nativeElement.value;

    const numericValue = Number(rawValue.replace(/[^0-9.]/g, ''));

    if (!isNaN(numericValue)) {
      this.quoteForm.get('price')?.setValue(numericValue);

      this.priceInput.nativeElement.value =
        this.currencyPipe.transform(numericValue, 'USD', 'symbol', '1.2-2') ?? '';
    } else {
      this.priceInput.nativeElement.value = '';
    }
  }

  onFocusPrice() {
    const value = this.quoteForm.get('price')?.value;

    if (value !== null && value !== '' && !isNaN(value)) {
      this.priceInput.nativeElement.value = value;
    }
  }

  pondHandleAddFile(event: any) {
    if (event?.file?.file) {
      this.pondFiles.push(event.file.file as File);
    }
  }

  onFileRemoved(event: any) {
  if (event?.file?.file) {
      const removedFile = event.file.file as File;
      this.pondFiles = this.pondFiles.filter(f => f !== removedFile);
    }
  }

}
