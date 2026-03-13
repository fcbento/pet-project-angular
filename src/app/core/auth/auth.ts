import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Field } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { finalize } from 'rxjs';
import { Button } from '../../ui/button/button';
import { FormInput } from '../../ui/form-input/form-input';
import { Session } from '../../utility/store/session/session.actions';
import { OpenToast } from '../../utility/store/toast/toast.actions';
import { ToastModel } from '../../utility/store/toast/toast.models';
import { AuthService } from '../services/auth';
import { AUTH, TOAST_LOGIN, TOAST_REGISTER } from './auth.const';
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
      .pipe(
        finalize(() => this.setLoaders(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ data }) => {
          this.store.dispatch(new Session({ access_token: data.access_token }));
          this.redirectAfterLoginSuccess();
        },
        error: () => {
          this.toast(TOAST_LOGIN.error);
        },
      });
  }

  private setLoaders(loading: boolean): void {
    this.loading.set(loading);
    this.authForm.isSubmitting.set(loading);
  }

  private toast(toast: ToastModel): void {
    this.store.dispatch(new OpenToast(toast));
  }

  private redirectAfterRegisterSuccess(): void {
    this.authForm.isSubmitting.set(true);
    setTimeout(() => {
      this.router.navigate(['/']);
      this.setLoaders(false);
    }, TOAST_REGISTER.success.duration);
  }

  private redirectAfterLoginSuccess(): void {
    this.authForm.isSubmitting.set(true);
    this.toast(TOAST_LOGIN.success);
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.setLoaders(false);
    }, TOAST_LOGIN.success.duration);
  }

  private register(): void {
    this.setLoaders(true);
    this.authService
      .register(this.authForm.registerForm().value())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast(TOAST_REGISTER.success);
          this.redirectAfterRegisterSuccess();
        },
        error: () => {
          this.toast(TOAST_REGISTER.error);
          this.setLoaders(false);
        },
      });
  }

  protected execute(): void {
    this.isLogin() ? this.login() : this.register();
  }

  protected redirect(): void {
    this.router.navigate([this.isLogin() ? '/register' : '/']);
  }
}
