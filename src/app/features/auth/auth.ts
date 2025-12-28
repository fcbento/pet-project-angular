import { Component, computed, inject } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '../../ui/button/button';
import { FormInput } from '../../ui/form-input/form-input';
import { AUTH } from './auth.const';
import { AuthUtils } from './auth.utils';

@Component({
  selector: 'app-auth',
  imports: [FormInput, Button, Field],
  templateUrl: './auth.html',
  providers: [AuthUtils],
})
export class Auth {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authUtils = inject(AuthUtils);

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
    this.isLogin() ? this.authUtils.loginForm().invalid() : this.authUtils.registerForm().invalid(),
  );

  protected readonly formulary = computed(() =>
    this.isLogin() ? this.authUtils.loginFormItems : this.authUtils.registerFormItems,
  );

  protected execute(): void {
    //TODO
  }

  protected redirect(): void {
    this.router.navigate([this.isLogin() ? '/register' : '/']);
  }
}
