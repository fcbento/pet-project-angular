import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Field } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Button } from '../../ui/button/button';
import { FormInput } from '../../ui/form-input/form-input';
import { Session } from '../../utility/session/session.actions';
import { AuthService } from '../services/auth';
import { AUTH } from './auth.const';
import { AuthForm } from './auth.form';

@Component({
  selector: 'app-auth',
  imports: [FormInput, Button, Field],
  templateUrl: './auth.html',
  providers: [AuthForm, AuthService],
})
export class Auth {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authForm = inject(AuthForm);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);

  protected readonly loading = signal(false);

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

  protected readonly disable = computed(() =>
    this.isLogin() ? this.authForm.loginForm().invalid() : this.authForm.registerForm().invalid(),
  );

  protected readonly formulary = computed(() =>
    this.isLogin() ? this.authForm.loginFormItems : this.authForm.registerFormItems,
  );

  private login(): void {
    this.setLoaders(true);
    this.authService
      .login(this.authForm.loginForm().value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ email, token }) => {
          this.store.dispatch(new Session({ email, token }));
        },
      })
      .add(() => this.setLoaders(false));
  }

  private setLoaders(loading: boolean): void {
    this.loading.set(loading);
    this.authForm.isSubmitting.set(loading);
  }

  private register(): void {
    this.setLoaders(true);
    this.authService
      .login(this.authForm.registerForm().value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
      })
      .add(() => this.setLoaders(false));
  }

  protected execute(): void {
    this.isLogin() ? this.login() : this.register();
  }

  protected redirect(): void {
    this.router.navigate([this.isLogin() ? '/register' : '/']);
  }
}
