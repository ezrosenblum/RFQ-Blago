export interface ValidationErrors {
  [key: string]: string[];
}

export interface FormFieldError {
  field: string;
  message: string;
}
