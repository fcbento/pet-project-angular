import { Injectable, signal } from '@angular/core';
import { form, required, min } from '@angular/forms/signals';

export interface ComboModel {
  name: string;
  filterCategoryId: number | null;
  selectedProductId: number | null;
  selectedQuantity: number;
  sellPrice: number;
  ifoodSellPrice: number;
}

@Injectable()
export class ComboForm {
  public readonly model = signal<ComboModel>({
    name: '',
    filterCategoryId: null,
    selectedProductId: null,
    selectedQuantity: 1,
    sellPrice: 0,
    ifoodSellPrice: 0
  });

  public readonly isSubmitting = signal(false);

  public readonly form = form(this.model, (schema) => {
    required(schema.name, { message: 'Nome é obrigatório' });
    required(schema.sellPrice, { message: 'Preço é obrigatório' });
    min(schema.sellPrice, 0.01, { message: 'Preço deve ser maior que zero' });
  });

  public reset(): void {
    this.form().reset({
      name: '',
      filterCategoryId: null,
      selectedProductId: null,
      selectedQuantity: 1,
      sellPrice: 0,
      ifoodSellPrice: 0
    });
  }
}
