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
import { IngredientResponse } from '../../../ingredient/ingredient.models';
import { TechnicalSheetForm } from './register.form';
import { IngredientDTO, IngredientSheetItem, TechnicalSheetRequest } from '../technical-sheet.models';

// Local state for ingredient selection
interface IngredientSelection {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  unitPrice: number;
  selected: boolean;
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

  // Central ingredients from API
  public readonly centralIngredients = signal<IngredientResponse[]>([]);

  // Ingredient selection state (checkboxes + yield)
  public readonly ingredientSelections = signal<IngredientSelection[]>([]);

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

  // Auto-fill if productId is in query params
  public readonly isEditMode = signal(false);

  public constructor() {
    // Load central ingredients
    this.loadIngredients();

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

  private loadIngredients(): void {
    this.ingredientService.findAll().subscribe({
      next: (ingredients) => {
        this.centralIngredients.set(ingredients);
        // Initialize selection state (all unchecked, yield=0)
        this.ingredientSelections.set(
          ingredients.map(ing => ({
            ingredientId: ing.id,
            ingredientName: ing.name,
            unit: ing.unit,
            unitPrice: ing.unitPrice,
            selected: false,
          }))
        );
      }
    });
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
          stockQuantity: sheet.stockQuantity || 1,
        });

        // Mark ingredients from the sheet as selected
        this.ingredientSelections.update(selections => {
          return selections.map(sel => {
            const sheetIng = sheet.ingredients.find(i => i.ingredientId === sel.ingredientId);
            return { ...sel, selected: !!sheetIng };
          });
        });
      },
      error: () => {
        // No existing sheet — show blank form for new registration
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

        // Reset all ingredient selections
        this.ingredientSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
      },
    });
  }

  public onCategoryChange(value: string | number | null): void {
    this.selectedCategoryId.set(value ? Number(value) : null);
    this.selectedProductId.set(null);
    this.isEditMode.set(false);
    this.registerForm.resetForm();
    this.ingredientSelections.update(sels => sels.map(s => ({ ...s, selected: false })));
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
    }
  }

  public setPackagingType(type: 'PAPEL' | 'SAQUINHO'): void {
    this.registerForm.registerForm().reset({
      ...this.registerForm.registerForm().value(),
      packagingType: type,
    });
  }

  // Ingredient checkbox toggle
  public toggleIngredient(ingredientId: number): void {
    this.ingredientSelections.update(sels =>
      sels.map(s =>
        s.ingredientId === ingredientId
          ? { ...s, selected: !s.selected }
          : s
      )
    );
  }

  // Selected ingredients only
  public readonly selectedIngredients = computed(() =>
    this.ingredientSelections().filter(s => s.selected)
  );

  // Cost Calculations
  public readonly totalIngredientsCost = computed(() => {
    const yieldUnits = Number(this.registerForm.registerForm().value().yieldUnits) || 1;
    return this.selectedIngredients().reduce((acc, curr) => {
      return acc + (curr.unitPrice / yieldUnits);
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
  public readonly fixedOperationalCost = signal(1.00);

  public readonly unitCost = computed(() => {
    return this.totalIngredientsCost() + this.totalPackagingCost() + this.fixedOperationalCost();
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

  public readonly canSubmit = computed(() => {
    const val = this.registerForm.registerForm().value();
    const sellPrice = Number(val.sellPrice) || 0;
    const ifoodSellPrice = Number(val.ifoodSellPrice) || 0;
    const suggestedIfood = this.suggestedIfoodPrice();

    const resaleValid = !this.hasResaleValue() || this.isResaleMarginValid();

    return !!this.selectedProductId() &&
      this.selectedIngredients().length > 0 &&
      this.registerForm.registerForm().valid() &&
      sellPrice > 0 &&
      ifoodSellPrice >= suggestedIfood &&
      this.profit() >= 0 &&
      this.profitMargin() >= 0 &&
      resaleValid &&
      Number(val.stockQuantity) > 0;
  });

  public submit(): void {
    if (!this.canSubmit()) return;

    const formVal = this.registerForm.registerForm().value();
    const yieldUnits = Number(formVal.yieldUnits) || 1;

    const ingredientDTOs: IngredientDTO[] = this.selectedIngredients().map(sel => ({
      ingredientId: sel.ingredientId,
      yieldQuantity: yieldUnits,
    }));

    const request: TechnicalSheetRequest = {
      productId: this.selectedProductId()!,
      yieldUnits: yieldUnits,
      yieldWeight: Number(formVal.yieldWeight),
      storage: String(formVal.storage),
      validity: String(formVal.validity),
      ingredients: ingredientDTOs,
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
      stockQuantity: Number(formVal.stockQuantity) || 0
    };

    this.service.save(request).subscribe({
      next: () => {
        this.store.dispatch(
          new OpenToast({
            title: 'Sucesso',
            message: 'Ficha técnica salva com sucesso',
            type: 'success',
            duration: 1000
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
