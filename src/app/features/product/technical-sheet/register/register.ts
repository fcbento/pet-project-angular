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
import { IngredientService } from '../../../ingredient/ingredient.service';
import { PackagingService } from '../../../packaging/packaging.service';
import { IngredientResponse } from '../../../ingredient/ingredient.models';
import { PackagingResponse } from '../../../packaging/packaging.model';
import { TechnicalSheetForm } from './register.form';
import { IngredientDTO, TechnicalSheetRequest } from '../technical-sheet.models';

// Local state for selections
interface ItemSelection<T> {
  id: number;
  name: string;
  unitPrice: number;
  selected: boolean;
  extra?: any;
}

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
  private readonly ingredientService = inject(IngredientService);
  private readonly packagingService = inject(PackagingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  public readonly registerForm = inject(TechnicalSheetForm);
  private readonly currencyPipe = inject(CurrencyPipe);


  // Selection state
  public readonly selectedCategoryId = signal<number | null>(null);
  public readonly selectedProductId = signal<number | null>(null);
  public readonly loadingIngredientSelections = signal(false);
  public readonly loadingPackagingSelections = signal(false);

  // Resources
  public readonly categoryResource = rxResource({
    stream: () => this.categoryService.getAll(),
  });

  public readonly productResource = rxResource({
    stream: () => this.productService.getAll(),
  });

  // Masters from API
  public readonly centralIngredients = signal<IngredientResponse[]>([]);
  public readonly centralPackagings = signal<PackagingResponse[]>([]);

  // Selection states
  public readonly ingredientSelections = signal<ItemSelection<IngredientResponse>[]>([]);
  public readonly packagingSelections = signal<ItemSelection<PackagingResponse>[]>([]);

  // Computed Options
  public readonly categoryOptions = computed(() => {
    if (this.categoryResource.error() || this.productResource.error()) return [];
    const categories = this.categoryResource.value()?.data || [];
    const products = this.productResource.value()?.data || [];
    const categoryIdsWithProducts = new Set(products.map((p) => p.category?.id).filter(Boolean));
    return categories
      .filter((c) => categoryIdsWithProducts.has(c.id))
      .map((c) => ({ label: c.nome, value: c.id }));
  });

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

  // Auto-fill and modes
  public readonly isEditMode = signal(false);

  public constructor() {
    this.loadMasters();

    const params = this.route.snapshot.queryParams;
    if (params['productId']) {
      const id = Number(params['productId']);
      this.selectedProductId.set(id);
      this.loadExistingSheet(id);
    }

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

    effect(() => {
      const suggested = this.suggestedIfoodPrice();
      const currentVal = Number(this.registerForm.registerForm().value().ifoodSellPrice) || 0;
      if (suggested > 0 && currentVal < suggested) {
        this.registerForm.patchIfoodPrice(suggested);
      }
    }, { allowSignalWrites: true });
  }

  private loadMasters(): void {
    this.loadingIngredientSelections.set(true);
    this.loadingPackagingSelections.set(true);

    this.ingredientService.findAll().subscribe(ingredients => {
      this.centralIngredients.set(ingredients);
      this.ingredientSelections.set(ingredients.map(i => ({
        id: i.id, name: i.name, unitPrice: i.unitPrice, selected: false, extra: i.unit
      })));
    }).add(() => this.loadingIngredientSelections.set(false));

    this.packagingService.findAll().subscribe(packagings => {
      this.centralPackagings.set(packagings);
      this.packagingSelections.set(packagings.map(p => ({
        id: p.id, name: p.name, unitPrice: p.unitPrice, selected: false
      })));
    }).add(() => this.loadingPackagingSelections.set(false));
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
          sellPrice: sheet.sellPrice || 0,
          ifoodSellPrice: sheet.ifoodSellPrice || 0,
          hasResale: product?.hasResale || ((sheet.resalePrice ?? 0) > 0) || false,
          resalePrice: sheet.resalePrice || 0,
          stockQuantity: sheet.stockQuantity || 1,
        });

        // Sync selections
        this.ingredientSelections.update(sels => sels.map(s => ({
          ...s, selected: sheet.ingredients.some(i => i.ingredientId === s.id)
        })));

        this.packagingSelections.update(sels => sels.map(s => ({
          ...s, selected: sheet.packagings.some(p => p.id === s.id)
        })));
      },
      error: () => {
        this.isEditMode.set(false);
        this.registerForm.resetForm();
        if (product) {
          this.registerForm.registerForm().reset({
            ...this.registerForm.registerForm().value(),
            hasResale: product.hasResale || false,
            sellPrice: product.sellPrice || 0,
            ifoodSellPrice: product.ifoodSellPrice || 0,
            resalePrice: product.resalePrice || 0,
            stockQuantity: product.stockQuantity || 1
          });
        }
        this.ingredientSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
        this.packagingSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
      },
    });
  }

  public onCategoryChange(value: string | number | null): void {
    this.selectedCategoryId.set(value ? Number(value) : null);
    this.selectedProductId.set(null);
    this.isEditMode.set(false);
    this.registerForm.resetForm();
    this.ingredientSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
    this.packagingSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
  }

  public onProductChange(value: string | number | null): void {
    const id = value ? Number(value) : null;
    this.selectedProductId.set(id);
    if (id) {
      this.loadExistingSheet(id);
    } else {
      this.isEditMode.set(false);
      this.registerForm.resetForm();
      this.ingredientSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
      this.packagingSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
    }
  }

  public toggleIngredient(id: number): void {
    this.ingredientSelections.update(sels => sels.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  }

  public togglePackaging(id: number): void {
    this.packagingSelections.update(sels => sels.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  }

  public readonly selectedIngredients = computed(() => this.ingredientSelections().filter(s => s.selected));
  public readonly selectedPackagings = computed(() => this.packagingSelections().filter(s => s.selected));

  // Cost Calculations
  public readonly totalIngredientsCost = computed(() => {
    const yieldUnits = Number(this.registerForm.registerForm().value().yieldUnits) || 1;
    return this.selectedIngredients().reduce((acc, curr) => acc + (curr.unitPrice / yieldUnits), 0);
  });

  public readonly totalPackagingCost = computed(() => {
    return this.selectedPackagings().reduce((acc, curr) => acc + curr.unitPrice, 0);
  });

  public readonly fixedOperationalCost = signal(0.68);

  public readonly unitCost = computed(() => {
    return this.totalIngredientsCost() + this.totalPackagingCost() + this.fixedOperationalCost();
  });

  // Pricing & Profit
  public readonly sellPriceValue = computed(() => Number(this.registerForm.registerForm().value().sellPrice) || 0);
  public readonly ifoodSellPriceValue = computed(() => Number(this.registerForm.registerForm().value().ifoodSellPrice) || 0);

  public readonly suggestedIfoodPrice = computed(() => {
    const sell = this.sellPriceValue();
    return sell > 0 ? sell / 0.72 : 0;
  });

  public readonly profit = computed(() => this.sellPriceValue() - this.unitCost());
  public readonly profitMargin = computed(() => this.sellPriceValue() > 0 ? (this.profit() / this.sellPriceValue()) * 100 : 0);

  public readonly ifoodProfit = computed(() => (this.ifoodSellPriceValue() * 0.72) - this.unitCost());
  public readonly ifoodProfitMargin = computed(() => this.ifoodSellPriceValue() > 0 ? (this.ifoodProfit() / (this.ifoodSellPriceValue() * 0.72)) * 100 : 0);

  // Resale
  public readonly hasResaleValue = computed(() => this.registerForm.registerForm().value().hasResale);
  public readonly resalePriceValue = computed(() => Number(this.registerForm.registerForm().value().resalePrice) || 0);

  public readonly minResalePrice = computed(() => this.unitCost() > 0 ? Math.round((this.unitCost() / 0.8) * 100) / 100 : 0);
  public readonly maxResalePrice = computed(() => this.unitCost() > 0 ? Math.round((this.unitCost() / 0.75) * 100) / 100 : 0);

  public readonly isResaleMarginValid = computed(() => {
    if (!this.hasResaleValue()) return true;
    const price = this.resalePriceValue();
    return price >= this.minResalePrice() && price <= this.maxResalePrice();
  });

  public readonly resaleProfitUnit = computed(() => this.resalePriceValue() - this.unitCost());
  public readonly resaleMargin = computed(() => this.resalePriceValue() > 0 ? (this.resaleProfitUnit() / this.resalePriceValue()) * 100 : 0);

  public readonly canSubmit = computed(() => {
    const val = this.registerForm.registerForm().value();
    const suggestedIfood = this.suggestedIfoodPrice();
    return !!this.selectedProductId() &&
      this.selectedIngredients().length > 0 &&
      this.registerForm.registerForm().valid() &&
      this.sellPriceValue() > 0 &&
      this.ifoodSellPriceValue() >= (suggestedIfood - 0.01) && // Tolerância
      this.profit() >= 0 &&
      (!this.hasResaleValue() || this.isResaleMarginValid()) &&
      Number(val.stockQuantity) > 0;
  });

  public submit(): void {
    if (!this.canSubmit()) return;
    const formVal = this.registerForm.registerForm().value();
    const yieldUnits = Number(formVal.yieldUnits) || 1;

    const request: TechnicalSheetRequest = {
      productId: this.selectedProductId()!,
      yieldUnits,
      yieldWeight: Number(formVal.yieldWeight),
      storage: String(formVal.storage),
      validity: String(formVal.validity),
      ingredients: this.selectedIngredients().map(sel => ({ ingredientId: sel.id, yieldQuantity: yieldUnits })),
      packagingIds: this.selectedPackagings().map(sel => sel.id),
      sellPrice: this.sellPriceValue(),
      ifoodSellPrice: this.ifoodSellPriceValue(),
      hasResale: formVal.hasResale,
      resalePrice: formVal.hasResale ? Number(formVal.resalePrice) : 0,
      stockQuantity: Number(formVal.stockQuantity) || 0
    };

    this.service.save(request).subscribe({
      next: () => {
        this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Ficha técnica salva com sucesso', type: 'success', duration: 1000 }));
        this.router.navigate(['/dashboard/produto']);
      },
      error: () => this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao salvar ficha técnica', type: 'error' })),
    });
  }

  public cancel(): void {
    this.router.navigate(['/dashboard/produto']);
  }
}
