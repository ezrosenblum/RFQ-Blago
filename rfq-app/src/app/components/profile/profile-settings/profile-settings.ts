import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    });
  }
  ngOnInit(): void {}
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

  onSubmit(): void {}

  discardChanges(): void {}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength'])
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength'])
        return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}
