import { Injectable, signal } from '@angular/core';
import { form, required, min } from '@angular/forms/signals';

export interface PromotionModel {
  categoryId: number | null;
  productId: number | null;
  origin: string;
  promoPrice: number;
}

@Injectable()
export class PromotionForm {
  public readonly model = signal<PromotionModel>({
    categoryId: null,
    productId: null,
    origin: 'BALCAO',
    promoPrice: 0
  });

  public readonly isSubmitting = signal(false);

  public readonly form = form(this.model, (schema) => {
    required(schema.categoryId, { message: 'Categoria é obrigatória' });
    required(schema.productId, { message: 'Produto é obrigatório' });
    required(schema.origin, { message: 'Canal é obrigatório' });
    required(schema.promoPrice, { message: 'Preço é obrigatório' });
    min(schema.promoPrice, 0.01, { message: 'Preço deve ser maior que zero' });
  });

  public reset(): void {
    this.form().reset({
      categoryId: null,
      productId: null,
      origin: 'BALCAO',
      promoPrice: 0
    });
  }
}
