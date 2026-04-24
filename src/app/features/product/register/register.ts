import { Component, computed, effect, inject, output, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { Store } from '@ngxs/store';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { FormSwitch } from '../../../ui/form-switch/form-switch';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { ToastModel } from '../../../utility/store/toast/toast.models';
import { UserSelectors } from '../../../utility/store/user/user.selectors';
import { CategoryService } from '../../category/category.service';
import { TOAST_PRODUCT } from '../product.const';
import { ProductService } from '../product.service';
import { RegisterForm } from './register.form';
import { ProductRequest } from './register.models';

@Component({
  selector: 'app-product-register',
  imports: [FormInput, FormSelect, FormSwitch, Button, Field],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [RegisterForm],
})
export class ProductRegister {
  private readonly form = inject(RegisterForm);
  private readonly service = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly store = inject(Store);

  private readonly user = this.store.selectSignal(UserSelectors.user);

  protected readonly loading = signal(false);

  protected readonly formulary = computed(() => this.form.registerFormItems());
  protected readonly disable = computed(() => this.form.registerForm().invalid() || this.loading());

  public readonly success = output();

  public constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe((response) => {
      const options = response.data.map((cat) => ({
        label: cat.nome,
        value: cat.id,
      }));
      this.form.setCategoryOptions(options);
    });
  }

  private toast(toast: ToastModel): void {
    this.store.dispatch(new OpenToast(toast));
  }

  public execute(): void {
    const formValue = this.form.registerForm()?.value();
    
    const request: ProductRequest = {
      name: formValue?.nome || '',
      categoryId: Number(formValue?.categoryId),
      costPrice: 0,
      sellPrice: 0,
      hasResale: formValue?.hasResale || false,
      criadoPor: this.user()?.name || '',
    };

    this.loading.set(true);
    this.service
      .create(request)
      .subscribe({
        next: () => {
          this.form.resetForm();
          this.success.emit();
          this.toast(TOAST_PRODUCT.success);
        },
        error: () => this.toast(TOAST_PRODUCT.error),
      })
      .add(() => this.loading.set(false));
  }
}
