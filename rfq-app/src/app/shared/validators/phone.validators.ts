
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator for US phone numbers
export function usPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; 
    }

    const phoneStr = control.value.toString().trim();

    const digitsOnly = phoneStr.replace(/\D/g, '');
    
    if (digitsOnly.length === 10) {
      const areaCode = digitsOnly.substring(0, 3);
      const exchange = digitsOnly.substring(3, 6);
 
      if (areaCode[0] === '0' || areaCode[0] === '1') {
        return { usPhone: { message: 'Area code cannot start with 0 or 1' } };
      }
      
      if (exchange[0] === '0' || exchange[0] === '1') {
        return { usPhone: { message: 'Exchange code cannot start with 0 or 1' } };
      }
      
      return null; 
    } else if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
 
      const areaCode = digitsOnly.substring(1, 4);
      const exchange = digitsOnly.substring(4, 7);
      
      if (areaCode[0] === '0' || areaCode[0] === '1') {
        return { usPhone: { message: 'Area code cannot start with 0 or 1' } };
      }
      
      if (exchange[0] === '0' || exchange[0] === '1') {
        return { usPhone: { message: 'Exchange code cannot start with 0 or 1' } };
      }
      
      return null; // Valid
    }
    
    return { usPhone: { message: 'Invalid US phone number format' } };
  };
}
