import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { FormItems } from '../../../utility/models/form-items.model';
import { ProductModel } from './register.models';

@Injectable()
export class RegisterForm {
  private readonly productModel = signal<ProductModel>({
    nome: '',
    categoryId: '',
    costPrice: 0,
    sellPrice: 0,
  });

  public readonly isSubmitting = signal(false);

  public readonly registerForm = form(this.productModel, (schemaPath) => {
    required(schemaPath.nome, { message: 'Nome é obrigatório' });
    required(schemaPath.categoryId, { message: 'Categoria é obrigatória' });
    required(schemaPath.costPrice, { message: 'Preço de custo é obrigatório' });
    required(schemaPath.sellPrice, { message: 'Preço de venda é obrigatório' });
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
      placeholder: 'Preço de custo',
      label: 'Preço de custo',
      type: 'number',
      field: this.registerForm.costPrice,
    },
    {
      placeholder: 'Preço de venda',
      label: 'Preço de venda',
      type: 'number',
      field: this.registerForm.sellPrice,
    },
  ]);

  public setCategoryOptions(options: { label: string; value: any }[]): void {
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
      costPrice: 0,
      sellPrice: 0,
    });
    this.registerFormItems.update((formItems) => {
      return formItems.map((item) => {
        let field: any = this.registerForm.nome;
        if (item.label === 'Categoria') field = this.registerForm.categoryId;
        if (item.label === 'Preço de custo') field = this.registerForm.costPrice;
        if (item.label === 'Preço de venda') field = this.registerForm.sellPrice;
        
        return {
          ...item,
          field,
        };
      });
    });
  }
}
