import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '../../ui/button/button';
import { FormInput } from '../../ui/form-input/form-input';
import { AUTH } from './auth.const';

@Component({
  selector: 'app-auth',
  imports: [FormInput, Button],
  templateUrl: './auth.html',
})
export class Auth {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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
    console.log('onClicked');
  }

  protected redirect(): void {
    this.router.navigate([this.isLogin() ? '/register' : '/']);
  }
}
