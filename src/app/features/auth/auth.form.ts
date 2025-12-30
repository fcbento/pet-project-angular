import { signal } from '@angular/core';
import { email, form, minLength, required, validate } from '@angular/forms/signals';
import { FormItems, LoginModel, RegisterModel } from './auth.models';

export class AuthForm {
  private readonly loginModel = signal<LoginModel>({
    email: '',
    password: '',
  });

  private readonly registerModel = signal<RegisterModel>({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  public readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.password, { message: 'Password is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 characters' });
  });

  public readonly registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.lastName, { message: 'Last name is required' });
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.password, { message: 'Password is required' });
    required(schemaPath.confirmPassword, { message: 'Confirm password is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 characters' });
    validate(schemaPath.confirmPassword, (value) => {
      if (this.registerForm().value().password !== value.value()) {
        return {
          message: 'Passwords do not match',
          kind: 'mismatch',
        };
      }
      return undefined;
    });
  });

  public readonly loginFormItems: FormItems[] = [
    {
      placeholder: 'Email',
      label: 'Email',
      type: 'email',
      field: this.loginForm.email,
    },
    {
      placeholder: 'Password',
      label: 'Password',
      type: 'password',
      field: this.loginForm.password,
    },
  ];

  public readonly registerFormItems: FormItems[] = [
    {
      placeholder: 'Name',
      label: 'Name',
      type: 'text',
      field: this.registerForm.name,
    },
    {
      placeholder: 'Last name',
      type: 'text',
      label: 'Last name',
      field: this.registerForm.lastName,
    },
    {
      placeholder: 'Email',
      label: 'Email',
      type: 'email',
      field: this.registerForm.email,
    },
    {
      placeholder: 'Password',
      label: 'Password',
      type: 'password',
      field: this.registerForm.password,
    },
    {
      placeholder: 'Confirm password',
      label: 'Confirm password',
      type: 'password',
      field: this.registerForm.confirmPassword,
    },
  ];
}
