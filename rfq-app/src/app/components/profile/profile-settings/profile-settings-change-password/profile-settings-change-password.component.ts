import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Auth } from '../../../../services/auth';
import { ChangePasswordRequest } from '../../../../models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../../services/alert.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile-settings-reset-password',
  standalone: false,
  templateUrl: './profile-settings-change-password.component.html',
  styleUrl: './profile-settings-change-password.component.scss',
})
export class ProfileSettingsChangePasswordComponent implements OnInit {
  passwordForm!: FormGroup;
  isEditingPassword = false;
  isSubmitting = false;
  hideOld = true;
  hideNew = true;
  hideConfirm = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private passwordService: Auth,
    private translate: TranslateService,
    private alertService: AlertService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password) return 'weak';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  private initializeForm(): void {
    this.passwordForm = this.formBuilder.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator,
          ],
        ],
        confirmNewPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const passwordValid =
      hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return passwordValid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    return newPassword.value === confirmNewPassword.value
      ? null
      : { passwordMismatch: true };
  }

  getClass(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field) return '';

    if ((field.touched || field.dirty) && field.invalid) {
      return 'is-invalid';
    }

    if ((field.touched || field.dirty) && field.valid) {
      return 'is-valid';
    }

    return '';
  }

  onEditPassword(): void {
    this.isEditingPassword = true;
    this.passwordForm.reset();
  }

  onCancel(): void {
    this.isEditingPassword = false;
    this.passwordForm.reset();
    this.hideOld = true;
    this.hideNew = true;
    this.hideConfirm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field || !field.errors) {
      if (
        fieldName === 'confirmNewPassword' &&
        this.passwordForm.errors?.['passwordMismatch'] &&
        field?.touched
      ) {
        return this.translate.instant('PROFILE.PASSWORDS_NOT_MATCHING');
      }
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return this.translate.instant(
        'PROFILE.' + this.getFieldTranslationKey(fieldName) + '_REQUIRED'
      );
    }

    if (errors['minlength']) {
      if (fieldName === 'newPassword') {
        return this.translate.instant('PROFILE.NEW_PASSWORD_MINLENGTH');
      }
      return this.translate.instant('PROFILE.MIN_LENGTH', {
        field: this.getFieldLabel(fieldName),
        min: errors['minlength'].requiredLength,
      });
    }

    if (fieldName === 'newPassword' && errors['passwordStrength']) {
      return this.translate.instant('PROFILE.PASSWORD_STRENGTH');
    }
    if (
      fieldName === 'confirmNewPassword' &&
      this.passwordForm.errors?.['passwordMismatch']
    ) {
      return this.translate.instant('PROFILE.PASSWORDS_NOT_MATCHING');
    }

    return this.translate.instant('PROFILE.INVALID_FORMAT', {
      field: this.getFieldLabel(fieldName),
    });
  }

  private getFieldTranslationKey(fieldName: string): string {
    const keys: { [key: string]: string } = {
      oldPassword: 'CURRENT_PASSWORD',
      newPassword: 'NEW_PASSWORD',
      confirmNewPassword: 'CONFIRM_NEW_PASSWORD',
    };
    return keys[fieldName] || fieldName.toUpperCase();
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      oldPassword: 'Current password',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
    };
    return labels[fieldName] || fieldName;
  }
  private markAllFieldsAsTouched(): void {
    Object.keys(this.passwordForm.controls).forEach((key) => {
      const control = this.passwordForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onSubmit(): void {
    if (this.passwordForm.valid && !this.isSubmitting) {
      this.alertService
        .confirm('PROFILE.CONFIRM_PASSWORD_CHANGE')
        .then((result) => {
          if (!result.isConfirmed) return;

          this.isSubmitting = true;

          const request: ChangePasswordRequest = {
            oldPassword: this.passwordForm.value.oldPassword,
            newPassword: this.passwordForm.value.newPassword,
          };

          this.passwordService
            .changePassword(request)
            .pipe(finalize(() => (this.isSubmitting = false)))
            .subscribe({
              next: () => {
                this.successMessage = this.translate.instant(
                  'PROFILE.PASSWORD_CHANGED_SUCCESS'
                );
                this.errorMessage = '';
                this.alertService.success('PROFILE.PASSWORD_CHANGED_SUCCESS');
                setTimeout(() => this.onCancel(), 3000);
              },
              error: (error) => {
                this.successMessage = '';
                const parsed = this.errorHandler.handleError(error);
                this.errorMessage =
                  this.translate.instant('PROFILE.PASSWORD_CHANGE_FAILED') +
                  ': ' +
                  parsed;
              },
            });
        });
    } else {
      this.markAllFieldsAsTouched();
    }
  }
}
