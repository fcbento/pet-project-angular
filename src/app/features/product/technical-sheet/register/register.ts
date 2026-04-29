import { Component, computed, inject, signal, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Field } from '@angular/forms/signals';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { CurrencyPipe, CommonModule, DecimalPipe } from '@angular/common';
import { Button } from '../../../../ui/button/button';
import { FormInput } from '../../../../ui/form-input/form-input';
import { FormSwitch } from '../../../../ui/form-switch/form-switch';
import { OpenToast } from '../../../../utility/store/toast/toast.actions';
import { ProductService } from '../../product.service';
import { CategoryService } from '../../../category/category.service';
import { TechnicalSheetService } from '../technical-sheet.service';
import { TechnicalSheetForm } from './register.form';
import { IngredientDTO, TechnicalSheetRequest } from '../technical-sheet.models';

@Component({
  selector: 'app-technical-sheet-register',
  standalone: true,
  imports: [FormInput, FormSwitch, Button, CurrencyPipe, DecimalPipe, Field, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [TechnicalSheetForm, CurrencyPipe],
})
export class TechnicalSheetRegister {
  protected readonly String = String;
  private readonly service = inject(TechnicalSheetService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  public readonly registerForm = inject(TechnicalSheetForm);
  private readonly currencyPipe = inject(CurrencyPipe);

  // Selection state
  public readonly selectedCategoryId = signal<number | null>(null);
  public readonly selectedProductId = signal<number | null>(null);

  // Resources
  public readonly categoryResource = rxResource({
    stream: () => this.categoryService.getAll(),
  });

  public readonly productResource = rxResource({
    stream: () => this.productService.getAll(),
  });

  // Computed Options — only categories that have at least one product
  public readonly categoryOptions = computed(() => {
    if (this.categoryResource.error() || this.productResource.error()) return [];
    const categories = this.categoryResource.value()?.data || [];
    const products = this.productResource.value()?.data || [];
    const categoryIdsWithProducts = new Set(products.map((p) => p.category?.id).filter(Boolean));
    return categories
      .filter((c) => categoryIdsWithProducts.has(c.id))
      .map((c) => ({ label: c.nome, value: c.id }));
  });

  public readonly isCategorySelected = computed(() => !!this.selectedCategoryId());

  public readonly productOptions = computed(() => {
    if (this.productResource.error()) return [];
    const products = this.productResource.value()?.data || [];
    const catId = this.selectedCategoryId();
    if (!catId) return [];
    return products
      .filter((p) => p.category?.id == catId)
      .map((p) => ({ label: p.name, value: p.id, product: p }));
  });

  public readonly selectedProduct = computed(() => {
    if (this.productResource.error()) return undefined;
    const products = this.productResource.value()?.data || [];
    const id = this.selectedProductId();
    return products.find((p) => p.id === id);
  });

  public readonly isGeladinho = computed(() => {
    const catName = this.selectedProduct()?.category?.nome?.toLowerCase() || '';
    return catName.includes('geladinho') || catName.includes('gelado');
  });

  public readonly isPicole = computed(() => {
    const catName = this.selectedProduct()?.category?.nome?.toLowerCase() || '';
    return catName.includes('picolé') || catName.includes('picole');
  });

  public readonly isPapel = computed(() => this.registerForm.registerForm().value().packagingType === 'PAPEL');
  public readonly isSaquinho = computed(() => this.registerForm.registerForm().value().packagingType === 'SAQUINHO');

  // Ingredients State
  public readonly ingredients = signal<IngredientDTO[]>([]);
  public readonly newIngredientName = signal<string | number>('');
  public readonly newIngredientQuantity = signal<number>(0);
  public readonly newIngredientUnit = signal<string | number>('g');
  public readonly newIngredientValue = signal<number>(0);

  // Auto-fill if productId is in query params
  public readonly isEditMode = signal(false);

  public constructor() {
    const params = this.route.snapshot.queryParams;
    if (params['productId']) {
      const id = Number(params['productId']);
      this.selectedProductId.set(id);
      this.loadExistingSheet(id);
    }

    // Auto-select category if we have a product selected but no category
    effect(() => {
      if (this.productResource.error()) return;
      const products = this.productResource.value()?.data;
      const selectedId = this.selectedProductId();
      if (products && selectedId && !this.selectedCategoryId()) {
        const product = products.find((p) => p.id === selectedId);
        if (product) {
          this.selectedCategoryId.set(product.category.id);
        }
      }
    }, { allowSignalWrites: true });

    // Auto-fill iFood price if it's below the suggested minimum
    effect(() => {
      const suggested = this.suggestedIfoodPrice();
      const currentVal = Number(this.registerForm.registerForm().value().ifoodSellPrice) || 0;
      if (suggested > 0 && currentVal < suggested) {
        this.registerForm.patchIfoodPrice(suggested);
      }
    }, { allowSignalWrites: true });

  }

  private loadExistingSheet(productId: number): void {
    const product = this.selectedProduct();
    
    this.service.getByProductId(productId).subscribe({
      next: (sheet) => {
        this.isEditMode.set(true);
        this.registerForm.registerForm().reset({
          yieldUnits: sheet.yieldUnits,
          yieldWeight: sheet.yieldWeight,
          storage: sheet.storage,
          validity: sheet.validity,
          stickCost: sheet.packaging.stickCost,
          brandLabelCost: sheet.packaging.brandLabelCost,
          flavorLabelCost: sheet.packaging.flavorLabelCost,
          bagCost: sheet.packaging.bagCost,
          paperPackagingCost: sheet.packaging.paperPackagingCost,
          packagingType: sheet.packaging.packagingType || 'SAQUINHO',
          sellPrice: sheet.sellPrice || 0,
          ifoodSellPrice: sheet.ifoodSellPrice || 0,
          hasResale: product?.hasResale || ((sheet.resalePrice ?? 0) > 0) || false,
          resalePrice: sheet.resalePrice || 0,
        });
        this.ingredients.set(sheet.ingredients);
      },
      error: () => {
        // No existing sheet — show blank form for new registration
        this.isEditMode.set(false);
        this.registerForm.resetForm();
        
        // Se já temos o produto carregado, pegamos o estado dele (US-020)
        if (product) {
            this.registerForm.registerForm().reset({
                ...this.registerForm.registerForm().value(),
                hasResale: product.hasResale || false,
                sellPrice: product.sellPrice || 0,
                ifoodSellPrice: product.ifoodSellPrice || 0,
                resalePrice: product.resalePrice || 0
            });
        }
        
        this.ingredients.set([]);
      },
    });
  }

  public onCategoryChange(value: string | number | null): void {
    this.selectedCategoryId.set(value ? Number(value) : null);
    this.selectedProductId.set(null);
    this.isEditMode.set(false);
    this.registerForm.resetForm();
    this.ingredients.set([]);
  }

  public onProductChange(value: string | number | null): void {
    const id = value ? Number(value) : null;
    this.selectedProductId.set(id);
    if (id) {
      this.loadExistingSheet(id);
    } else {
      this.isEditMode.set(false);
      this.registerForm.resetForm();
      this.ingredients.set([]);
    }
  }

  public setPackagingType(type: 'PAPEL' | 'SAQUINHO'): void {
    this.registerForm.registerForm().reset({
      ...this.registerForm.registerForm().value(),
      packagingType: type,
    });
  }

  public onQuantityChange(value: string | number): void {
    this.newIngredientQuantity.set(Number(value) || 0);
  }

  public onValueChange(value: string | number): void {
    this.newIngredientValue.set(Number(value) || 0);
  }

  public addIngredient(): void {
    if (!this.newIngredientName() || this.newIngredientQuantity() <= 0) return;

    this.ingredients.update((list) => [
      ...list,
      {
        name: String(this.newIngredientName()),
        quantity: this.newIngredientQuantity(),
        unit: String(this.newIngredientUnit()),
        value: this.newIngredientValue(),
      },
    ]);

    this.newIngredientName.set('');
    this.newIngredientQuantity.set(0);
    this.newIngredientValue.set(0);
  }

  public removeIngredient(index: number): void {
    this.ingredients.update((list) => {
      const newList = [...list];
      newList.splice(index, 1);
      return newList;
    });
  }

  // Cost Calculations
  public readonly totalIngredientsCost = computed(() => {
    return this.ingredients().reduce((acc, curr) => {
      const qty = Number(curr.quantity) || 1;
      const val = Number(curr.value) || 0;
      return acc + (val / qty);
    }, 0);
  });

  public readonly totalPackagingCost = computed(() => {
    const val = this.registerForm.registerForm().value();
    let total = 0;

    if (this.isPicole()) {
      total += Number(val.stickCost) || 0;
      if (this.isPapel()) {
        total += Number(val.paperPackagingCost) || 0;
      } else if (this.isSaquinho()) {
        total += Number(val.bagCost) || 0;
        total += Number(val.brandLabelCost) || 0;
        total += Number(val.flavorLabelCost) || 0;
      }
    } else if (this.isGeladinho()) {
      total += Number(val.bagCost) || 0;
      total += Number(val.brandLabelCost) || 0;
      total += Number(val.flavorLabelCost) || 0;
    } else {
      total += Number(val.stickCost) || 0;
      total += Number(val.brandLabelCost) || 0;
      total += Number(val.flavorLabelCost) || 0;
      total += Number(val.bagCost) || 0;
      total += Number(val.paperPackagingCost) || 0;
    }

    return total;
  });

  // Fixed Operational Cost
  public readonly fixedOperationalCost = signal(0.74);

  public readonly totalCost = computed(() => {
    const yieldUnits = Number(this.registerForm.registerForm().value().yieldUnits) || 1;
    return this.totalIngredientsCost() + this.totalPackagingCost() + (this.fixedOperationalCost() * yieldUnits);
  });

  public readonly unitCost = computed(() => {
    const yieldUnits = Number(this.registerForm.registerForm().value().yieldUnits) || 1;
    return (this.totalIngredientsCost() + this.totalPackagingCost()) / yieldUnits + this.fixedOperationalCost();
  });

  // Pricing & Profit
  public readonly sellPrice = computed(() => {
    return Number(this.registerForm.registerForm().value().sellPrice) || 0;
  });

  public readonly suggestedIfoodPrice = computed(() => {
    const sell = this.sellPrice();
    if (sell <= 0) return 0;
    return sell / 0.72; // Markup for 28% fee: Price / (1 - 0.28)
  });

  public readonly ifoodSellPriceValue = computed(() => {
    return Number(this.registerForm.registerForm().value().ifoodSellPrice) || 0;
  });

  public readonly profit = computed(() => {
    return this.sellPrice() - this.unitCost();
  });

  public readonly profitMargin = computed(() => {
    const sell = this.sellPrice();
    if (sell <= 0) return 0;
    return (this.profit() / sell) * 100;
  });

  public readonly markup = computed(() => {
    const cost = this.unitCost();
    if (cost <= 0) return 0;
    return (this.profit() / cost) * 100;
  });

  public readonly ifoodProfit = computed(() => {
    const ifoodPrice = this.ifoodSellPriceValue();
    if (ifoodPrice <= 0) return 0;
    return (ifoodPrice * 0.72) - this.unitCost();
  });

  public readonly ifoodMarkup = computed(() => {
    const cost = this.unitCost();
    if (cost <= 0) return 0;
    return (this.ifoodProfit() / cost) * 100;
  });

  public readonly ifoodProfitMargin = computed(() => {
    const ifoodPrice = this.ifoodSellPriceValue();
    if (ifoodPrice <= 0) return 0;
    const ifoodNetRevenue = ifoodPrice * 0.72;
    return (this.ifoodProfit() / ifoodNetRevenue) * 100;
  });

  // Resale Calculations
  public readonly hasResaleValue = computed(() => this.registerForm.registerForm().value().hasResale);
  public readonly resalePriceValue = computed(() => Number(this.registerForm.registerForm().value().resalePrice) || 0);

  public readonly minResalePrice = computed(() => {
    const cost = this.unitCost();
    return cost > 0 ? Math.round((cost / 0.8) * 100) / 100 : 0;
  });

  public readonly maxResalePrice = computed(() => {
    const cost = this.unitCost();
    return cost > 0 ? Math.round((cost / 0.75) * 100) / 100 : 0;
  });

  public readonly isResaleMarginValid = computed(() => {
    if (!this.hasResaleValue()) return true;
    const price = this.resalePriceValue();
    return price >= this.minResalePrice() && price <= this.maxResalePrice();
  });

  public readonly resaleProfitUnit = computed(() => this.resalePriceValue() - this.unitCost());
  public readonly resaleMargin = computed(() => {
    const price = this.resalePriceValue();
    return price > 0 ? (this.resaleProfitUnit() / price) * 100 : 0;
  });

  public readonly canAddItem = computed(() => {
    return !!this.newIngredientName() && this.newIngredientQuantity() > 0 && this.newIngredientValue() > 0;
  });

  public readonly canSubmit = computed(() => {
    const sellPrice = Number(this.registerForm.registerForm().value().sellPrice) || 0;
    const ifoodSellPrice = Number(this.registerForm.registerForm().value().ifoodSellPrice) || 0;
    const suggestedIfood = this.suggestedIfoodPrice();

    const resalePrice = this.resalePriceValue();
    const resaleValid = !this.hasResaleValue() || this.isResaleMarginValid();

    return !!this.selectedProductId() &&
      this.ingredients().length > 0 &&
      this.registerForm.registerForm().valid() &&
      sellPrice > 0 &&
      ifoodSellPrice >= suggestedIfood &&
      this.profit() >= 0 &&
      this.profitMargin() >= 0 &&
      resaleValid;
  });

  public submit(): void {
    if (!this.canSubmit()) return;

    const formVal = this.registerForm.registerForm().value();

    const request: TechnicalSheetRequest = {
      productId: this.selectedProductId()!,
      yieldUnits: Number(formVal.yieldUnits),
      yieldWeight: Number(formVal.yieldWeight),
      storage: String(formVal.storage),
      validity: String(formVal.validity),
      ingredients: this.ingredients(),
      packaging: {
        stickCost: Number(formVal.stickCost) || 0,
        brandLabelCost: Number(formVal.brandLabelCost) || 0,
        flavorLabelCost: Number(formVal.flavorLabelCost) || 0,
        bagCost: Number(formVal.bagCost) || 0,
        paperPackagingCost: Number(formVal.paperPackagingCost) || 0,
        packagingType: formVal.packagingType,
      },
      sellPrice: Number(formVal.sellPrice) || 0,
      ifoodSellPrice: Number(formVal.ifoodSellPrice) || 0,
      hasResale: formVal.hasResale,
      resalePrice: formVal.hasResale ? Number(formVal.resalePrice) : 0,
    };

    this.service.save(request).subscribe({
      next: () => {
        this.store.dispatch(
          new OpenToast({
            title: 'Sucesso',
            message: 'Ficha técnica salva com sucesso',
            type: 'success',
          })
        );
        this.router.navigate(['/dashboard/produto']);
      },
      error: () => {
        this.store.dispatch(
          new OpenToast({
            title: 'Erro',
            message: 'Erro ao salvar ficha técnica',
            type: 'error',
          })
        );
      },
    });
  }

  public cancel(): void {
    this.router.navigate(['/dashboard/produto']);
  }
}
