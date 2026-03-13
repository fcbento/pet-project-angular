import { HttpStatusCode } from '@angular/common/http';

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

export interface LoginResponse {
  access_token: string;
}

export interface AuthError {
  message: string;
  type: string;
  status: HttpStatusCode;
  date: string;
}
