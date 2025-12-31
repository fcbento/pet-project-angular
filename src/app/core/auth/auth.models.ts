import { HttpStatusCode } from '@angular/common/http';
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

export interface LoginResponse {
  token: string;
  type: string;
  email: string;
}

export interface AuthError {
  message: string;
  type: string;
  status: HttpStatusCode;
  date: string;
}
