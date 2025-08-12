import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RfqService } from '../../../../services/rfq';
import { LookupValue } from '../../../../models/user.model';
import { AlertService } from '../../../../services/alert.service';

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

  constructor(
    private _dialogRef: MatDialogRef<QuoteFormDialog>, 
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private formBuilder: FormBuilder,
    private rfqService: RfqService,
    private alertService: AlertService
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
      quoteValidityIntervalType: [null, [Validators.required]],
      quoteValidityInterval: [0, [Validators.required, Validators.min(1)]],
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
      const formData = this.quoteForm.value;
      formData.vendorId = this.vendorId;
      formData.submissionId = this.rfqId;
      this.rfqService.saveQuote(formData).subscribe({
        next: (response) => {
          if (this.action === 'Add') {
            this.alertService.success('VENDOR.QUOTE_SUBMITTED_SUCCESS');
          } else {
            this.alertService.success('VENDOR.QUOTE_UPDATED_SUCCESS');
          }

          this.isSubmitting = false;
          setTimeout(() => {
            this._dialogRef.close(formData);
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
}
