import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { FormItems } from '../../../utility/models/form-items.model';
import { CategoriaModel } from './register.models';

@Injectable()
export class RegisterForm {
  private readonly categoriaModel = signal<CategoriaModel>({
    nome: '',
  });

  public readonly isSubmitting = signal(false);

  public readonly registerForm = form(this.categoriaModel, (schemaPath) => {
    required(schemaPath.nome, { message: 'Nome é obrigatório' });
  });

  public readonly registerFormItems = signal<FormItems[]>([
    {
      placeholder: 'Nome',
      label: 'Nome',
      type: 'text',
      field: this.registerForm.nome,
    },
  ]);

  public resetForm(): void {
    this.registerForm().reset({ nome: '' });
    this.registerFormItems.update((formItems) => {
      return formItems.map((item) => {
        return {
          ...item,
          field: this.registerForm.nome,
        };
      });
    });
  }
}
