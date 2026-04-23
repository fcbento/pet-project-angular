import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

import { SaleOrigin } from '../sale.models';

export interface SaleRegisterModel {
  origem: SaleOrigin | '';
  sellDate: string;
}

@Injectable()
export class SaleRegisterForm {
  private readonly saleModel = signal<SaleRegisterModel>({
    origem: '',
    sellDate: '',
  });

  public readonly isSubmitting = signal(false);

  public readonly registerForm = form(this.saleModel, (schemaPath) => {
    required(schemaPath.origem, { message: 'Origem é obrigatória' });
    required(schemaPath.sellDate, { message: 'Data da venda é obrigatória' });
  });

  public resetForm(): void {
    this.registerForm().reset({
      origem: '',
      sellDate: '',
    });
  }
}
