import { Component, computed, inject, output, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { Store } from '@ngxs/store';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { ToastModel } from '../../../utility/store/toast/toast.models';
import { UserSelectors } from '../../../utility/store/user/user.selectors';
import { TOAST_CATEGORY } from '../category.const';
import { CategoryService } from '../category.service';
import { RegisterForm } from './register.form';
import { CategoryRequest } from './register.models';

@Component({
  selector: 'app-register',
  imports: [FormInput, Button, Field],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [RegisterForm],
})
export class Register {
  private readonly form = inject(RegisterForm);
  private readonly service = inject(CategoryService);
  private readonly store = inject(Store);

  private readonly user = this.store.selectSignal(UserSelectors.user);

  private readonly request = computed<CategoryRequest>(() => ({
    nome: this.form.registerForm()?.value()?.nome,
    criadoPor: this.user()?.name || '',
  }));

  protected readonly loading = signal(false);

  protected readonly formulary = computed(() => this.form.registerFormItems());
  protected readonly disable = computed(() => this.form.registerForm().invalid() || this.loading());

  public readonly success = output();

  private toast(toast: ToastModel): void {
    this.store.dispatch(new OpenToast(toast));
  }

  public execute(): void {
    this.loading.set(true);
    this.service
      .create(this.request())
      .subscribe({
        next: () => {
          this.form.resetForm();
          this.success.emit();
          this.toast(TOAST_CATEGORY.success);
        },
        error: () => this.toast(TOAST_CATEGORY.error),
      })
      .add(() => this.loading.set(false));
  }
}
