export interface ValidationErrors {
  [key: string]: string[];
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
  type: string;
  file?: File;
}