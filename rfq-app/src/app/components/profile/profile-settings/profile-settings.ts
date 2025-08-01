import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

@Component({
  standalone: false,
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettingsComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() updateProfile: EventEmitter<void> = new EventEmitter();

  userForm: FormGroup;
  isSubmitting: boolean = false;
  initialUserData: User | null = null;
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  selectedFileName: string | null = null;

  errors: ValidationErrors | null = null;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        null,
        [Validators.minLength(9), Validators.pattern('^\\+?[0-9]{0,20}$')],
      ],
      profilePicture: [''],
      companyName: [''],
      businessAddress: [''],
      contactPerson: [''],
      businessDescription: [''],
      companySize: [''],
      yearsInBusiness: [''],
    });
  }
  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber,
        profilePicture: this.user.profilePicture,
      });
      this.initialUserData = { ...this.user };
    }
  }
  filterPhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9+]/g, '');
    this.userForm.get('phoneNumber')?.setValue(input.value);
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImageUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onDeleteImage(): void {
    this.previewImageUrl = null;
    this.selectedFile = null;
  }

  hasChanges(): boolean {
    return (
      this.userForm.dirty ||
      this.previewImageUrl !== this.initialUserData?.profilePicture
    );
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      this.updateProfile.emit();
      this.isSubmitting = false;
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  discardChanges(): void {
    if (this.initialUserData) {
      this.userForm.reset(this.initialUserData);
      this.previewImageUrl = this.initialUserData.profilePicture || null;
      this.selectedFile = null;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

}
