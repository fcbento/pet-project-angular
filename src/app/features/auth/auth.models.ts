import { FieldTree } from '@angular/forms/signals';

export interface LoginModel {
  email: string;
  password: string;
}

export interface RegisterModel {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormItems {
  placeholder: string;
  label: string;
  type: string;
  field: FieldTree<string>;
}
