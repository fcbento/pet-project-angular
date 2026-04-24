import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { FormItems } from '../../../utility/models/form-items.model';
import { ProductModel } from './register.models';

@Injectable()
export class RegisterForm {
  private readonly productModel = signal<ProductModel>({
    nome: '',
    categoryId: '',
    hasResale: false,
  });

  public readonly isSubmitting = signal(false);

  public readonly registerForm = form(this.productModel, (schemaPath) => {
    required(schemaPath.nome, { message: 'Nome é obrigatório' });
    required(schemaPath.categoryId, { message: 'Categoria é obrigatória' });
  });

  public readonly registerFormItems = signal<FormItems[]>([
    {
      placeholder: 'Nome',
      label: 'Nome',
      type: 'text',
      field: this.registerForm.nome,
    },
    {
      placeholder: 'Selecione uma categoria',
      label: 'Categoria',
      type: 'select',
      field: this.registerForm.categoryId,
      options: [],
    },
    {
      label: 'Produto possui Revenda?',
      type: 'switch',
      field: this.registerForm.hasResale,
      placeholder: 'Produto possui Revenda?',
    },
  ]);

  public setCategoryOptions(options: { label: string; value: string | number }[]): void {
    this.registerFormItems.update((items) => {
      return items.map((item) => {
        if (item.type === 'select' && item.label === 'Categoria') {
          return { ...item, options };
        }
        return item;
      });
    });
  }

  public resetForm(): void {
    this.registerForm().reset({
      nome: '',
      categoryId: '',
      hasResale: false,
    });
    this.registerFormItems.update((formItems) => {
      return formItems.map((item) => {
        let field = this.registerForm.nome as any;
        if (item.label === 'Categoria') field = this.registerForm.categoryId;

        return {
          ...item,
          field,
        };
      });
    });
  }
}
