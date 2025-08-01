import { Component, forwardRef, Input } from '@angular/core';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-phone-input',
  templateUrl: './phone-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent {
 @Input() formControlName!: string;
  
  // Internal form control for the phone input
  control = new FormControl('');

  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;

  preferredCountries = [CountryISO.UnitedStates];
  onlyCountries = [
    'us', 'ca', 'pr', 'vi', 'gu', 'mp', 'as', 'ag', 'ai', 'bb', 'bm', 'bs', 
    'dm', 'do', 'gd', 'jm', 'kn', 'lc', 'ms', 'tc', 'tt', 'vc', 'vg',
  ];
  selectedCountryISO = CountryISO.UnitedStates;

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    // Subscribe to changes in the internal form control
    this.control.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  // Called when the form control value changes from the outside
  writeValue(value: any): void {
    if (value !== undefined) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  // Register the onChange callback
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  // Register the onTouched callback
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Handle disabled state
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  // Call this when the input loses focus
  onBlur(): void {
    this.onTouched();
  }
}
