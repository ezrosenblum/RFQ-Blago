export class PhoneNumberFormatter {
  static formatUsPhone(value: string): string {
    if (!value) return '';

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Handle different lengths
    if (digitsOnly.length === 0) return '';

    if (digitsOnly.length <= 3) {
      return `(${digitsOnly}`;
    } else if (digitsOnly.length <= 6) {
      return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3)}`;
    } else if (digitsOnly.length <= 10) {
      return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(
        3,
        6
      )}-${digitsOnly.substring(6)}`;
    } else if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
      // Handle country code
      return `+1 (${digitsOnly.substring(1, 4)}) ${digitsOnly.substring(
        4,
        7
      )}-${digitsOnly.substring(7)}`;
    }

    // If more than 10 digits and doesn't start with 1, just format the first 10
    return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(
      3,
      6
    )}-${digitsOnly.substring(6, 10)}`;
  }
}
