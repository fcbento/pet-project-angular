import { Injectable, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

export interface TechnicalSheetModel {
  yieldUnits: number;
  yieldWeight: number;
  storage: string;
  validity: string;
  stickCost: number;
  brandLabelCost: number;
  flavorLabelCost: number;
  bagCost: number;
  paperPackagingCost: number;
  packagingType: 'PAPEL' | 'SAQUINHO';
  sellPrice: number;
  ifoodSellPrice: number;
  hasResale: boolean; // US-013
  resalePrice: number;
  stockQuantity: number;
}

@Injectable()
export class TechnicalSheetForm {
  private readonly technicalSheetModel = signal<TechnicalSheetModel>({
    yieldUnits: 1,
    yieldWeight: 0,
    storage: 'Freezer (-18°C)',
    validity: '180 dias',
    stickCost: 0,
    brandLabelCost: 0.05,
    flavorLabelCost: 0.03,
    bagCost: 0.06,
    paperPackagingCost: 0.15,
    packagingType: 'SAQUINHO',
    sellPrice: 0,
    ifoodSellPrice: 0,
    hasResale: false,
    resalePrice: 0,
    stockQuantity: 1,
  });

  public readonly registerForm = form(this.technicalSheetModel, (schemaPath) => {
    required(schemaPath.yieldUnits, { message: 'Rendimento é obrigatório' });
    required(schemaPath.sellPrice, { message: 'Preço de venda é obrigatório' });
    required(schemaPath.stockQuantity, { message: 'Quantidade em estoque é obrigatória' });
  });

  public patchIfoodPrice(value: number): void {
    const current = this.registerForm().value();
    this.registerForm().reset({
        ...current,
        ifoodSellPrice: value
    });
  }

  public patchHasResale(value: boolean): void {
    const current = this.registerForm().value();
    this.registerForm().reset({
        ...current,
        hasResale: value
    });
  }

  public resetForm(): void {
    this.registerForm().reset({
      yieldUnits: 1,
      yieldWeight: 0,
      storage: 'Freezer (-18°C)',
      validity: '180 dias',
      stickCost: 0,
      brandLabelCost: 0.05,
      flavorLabelCost: 0.03,
      bagCost: 0.06,
      paperPackagingCost: 0.15,
      packagingType: 'SAQUINHO',
      sellPrice: 0,
      ifoodSellPrice: 0,
      hasResale: false,
      resalePrice: 0,
      stockQuantity: 1,
    });
  }
}
