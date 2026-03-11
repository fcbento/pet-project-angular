import { Injectable, signal } from '@angular/core';
import { disabled, email, form, minLength, required, validate } from '@angular/forms/signals';
import { FormItems } from '../../utility/models/form-items.model';
import { LoginModel, RegisterModel } from './auth.models';

@Injectable()
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

  public readonly isSubmitting = signal(false);

  public readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.password, { message: 'Password is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 characters' });
    disabled(schemaPath.email, () => this.isSubmitting());
    disabled(schemaPath.password, () => this.isSubmitting());
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

    disabled(schemaPath.name, () => this.isSubmitting());
    disabled(schemaPath.lastName, () => this.isSubmitting());
    disabled(schemaPath.email, () => this.isSubmitting());
    disabled(schemaPath.password, () => this.isSubmitting());
    disabled(schemaPath.confirmPassword, () => this.isSubmitting());
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
