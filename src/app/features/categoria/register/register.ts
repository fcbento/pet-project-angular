import { Component, computed, inject, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { RegisterForm } from './register.form';

@Component({
  selector: 'app-register',
  imports: [FormInput, Button, Field],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [RegisterForm],
})
export class Register {
  private readonly registerForm = inject(RegisterForm);

  protected readonly loading = signal(false);

  protected readonly formulary = computed(() => this.registerForm.registerFormItems);
  protected readonly disable = computed(
    () => this.registerForm.registerForm().invalid() || this.loading(),
  );

  public execute(): void {}
}
