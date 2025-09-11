import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RfqService } from '../../../../services/rfq';
import { LookupValue } from '../../../../models/user.model';
import { AlertService } from '../../../../services/alert.service';
import { CurrencyPipe } from '@angular/common';
import { FilePondComponent } from 'ngx-filepond';
import { QuillEditorComponent } from 'ngx-quill';
import { TranslateService } from '@ngx-translate/core';

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
  @ViewChild('messageInput') messageInput!: QuillEditorComponent;
  toolbarOptions = [];
  modules = {
    toolbar: this.toolbarOptions
  };
  priceTypes: LookupValue[] = [];
  rfqTitle: string = '';
  rfqDescription: string = '';
  isOtherTypeSelected: boolean = false;
  isDescriptionExpanded = false;

  constructor(
    private _dialogRef: MatDialogRef<QuoteFormDialog>,
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private formBuilder: FormBuilder,
    private rfqService: RfqService,
    private alertService: AlertService,
    private currencyPipe: CurrencyPipe,
    private _translate: TranslateService
  ){
    if (this._data) {
      this.action = this._data.action || 'Add';
      this.customerId = this._data.customerId || null;
      this.vendorId = this._data.vendorId || null;
      this.rfqId = this._data.rfqId || null;
      this.rfqTitle = this._data.title || '';
      this.rfqDescription = this._data.description || '';
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
    this.loadPriceTypes();
  }

  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      title: [''],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      priceType: [null, [Validators.required]],
      priceTypeOther: [''],
      quoteValidityInterval: [0, [Validators.required, Validators.min(1)]],
      quoteValidityIntervalType: [null, [Validators.required]],
      timelineDescription: [null, [Validators.required]],
      vendorId: [],
      submissionId: []
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
  if (this.quoteForm.valid) {
    this.isSubmitting = true;

    const quoteEntry = this.quoteForm.value;
    quoteEntry.vendorId = this.vendorId;
    quoteEntry.submissionId = this.rfqId;

    // Create FormData object
    const formData = new FormData();
    const formValues = this.quoteForm.value;
    formData.append('title', this.rfqTitle || '');
    formData.append('description', formValues.description || '');
    formData.append('price', String(formValues.price || 0));
    formData.append('quoteValidityInterval', String(formValues.quoteValidityInterval || 0));
    formData.append('quoteValidityIntervalType', String(formValues.quoteValidityIntervalType || ''));
    formData.append('timelineDescription', String(formValues.timelineDescription || ''));
    formData.append('vendorId', String(this.vendorId || ''));
    formData.append('submissionId', String(this.rfqId || ''));

    this.pondFiles.forEach(file => {
      formData.append('Files', file, file.name);
    });

    if (this.isOtherTypeSelected && formValues.priceTypeOther) {
      formData.append('priceTypeOther', formValues.priceTypeOther);
    } else if (formValues.priceType && formValues.priceType !== 'other') {
      formData.append('priceType', String(formValues.priceType));
    }
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
          this._dialogRef.close(quoteEntry);
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

  onBlurPrice() {
    const rawValue = this.priceInput.nativeElement.value;

    const numericValue = Number(rawValue.replace(/[^0-9.]/g, ''));

    if (!isNaN(numericValue)) {
      this.quoteForm.get('price')?.setValue(numericValue);

      this.priceInput.nativeElement.value =
        this.currencyPipe.transform(numericValue, 'USD', 'symbol', '1.0-2') ?? '';
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
      this.pondFiles = this.pondFiles.filter(f => f != removedFile);
    }
  }

  loadPriceTypes() {
    this.rfqService.getPriceTypes().subscribe({
      next: (types) => {
        this.priceTypes = types;
      },
      error: (error) => {
        console.error('Error loading price types:', error);
      }
    });
  }

  onTypeChange(event: any): void {
    const selectedValue = event.target.value;
    this.isOtherTypeSelected = selectedValue === '1: other';

    const priceTypeOtherControl = this.quoteForm.get('priceTypeOther');

    if (this.isOtherTypeSelected) {
      priceTypeOtherControl?.setValidators([Validators.required]);
      this.quoteForm.get('priceType')?.setValue('other');
    } else {
      priceTypeOtherControl?.clearValidators();
      priceTypeOtherControl?.setValue('');
    }
    priceTypeOtherControl?.updateValueAndValidity();
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }
}
