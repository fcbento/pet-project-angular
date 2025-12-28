import { Component, computed, inject, signal } from '@angular/core';
import { email, Field, form, minLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '../../ui/button/button';
import { FormInput } from '../../ui/form-input/form-input';
import { AUTH } from './auth.const';

@Component({
  selector: 'app-auth',
  imports: [FormInput, Button, Field],
  templateUrl: './auth.html',
})
export class Auth {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly loginModel = signal({
    email: '',
    password: '',
  });

  public readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    required(schemaPath.password, { message: 'Password is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 characters' });
  });

  protected readonly title = computed(() =>
    this.isLogin() ? AUTH.loginTitle : AUTH.registerTitle,
  );

  protected readonly description = computed(() =>
    this.isLogin() ? AUTH.loginDescription : AUTH.registerDescription,
  );

  protected readonly linkName = computed(() =>
    this.isLogin() ? AUTH.loginLinkName : AUTH.registerLinkName,
  );

  protected readonly buttonName = computed(() =>
    this.isLogin() ? AUTH.loginButtonName : AUTH.registerButtonName,
  );

  protected readonly isLogin = computed(() => this.route.snapshot.data['isLogin']);

  protected execute(): void {
    //TODO
  }

  protected redirect(): void {
    this.router.navigate([this.isLogin() ? '/register' : '/']);
  }
}
