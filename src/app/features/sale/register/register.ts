import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Field } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Button } from '../../../ui/button/button';
import { FormDate } from '../../../ui/form-date/form-date';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { ToastModel } from '../../../utility/store/toast/toast.models';
import { ProductService } from '../../product/product.service';
import { CategoryService } from '../../category/category.service';
import { ProductResponse } from '../../product/list/list.models';
import { SaleService } from '../sale.service';
import { SaleRegisterForm } from './register.form';
import { SaleItemRequest, SaleOrigin } from '../sale.models';

export interface SaleItemDraft {
  productId: number;
  productName: string;
  sellPrice: number;
  quantity: number;
  product: ProductResponse;
}

@Component({
  selector: 'app-sale-register',
  imports: [FormInput, FormDate, FormSelect, Button, CurrencyPipe, Field],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [SaleRegisterForm],
})
export class SaleRegister {
  private readonly service = inject(SaleService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  public readonly registerForm = inject(SaleRegisterForm);
  public readonly store = inject(Store);

  constructor() {
    effect(() => {
      const origem = this.registerForm.registerForm().value().origem;
      
      this.saleItems.update((items) => {
        let changed = false;
        const newItems = items.map((item) => {
          const product = item.product;
          if (!product) return item;
          
          const newPrice = origem === 'IFOOD' && product.ifoodSellPrice 
                        ? product.ifoodSellPrice 
                        : product.sellPrice;
                        
          if (newPrice !== item.sellPrice) {
            changed = true;
            return { ...item, sellPrice: newPrice };
          }
          return item;
        });
        
        return changed ? newItems : items;
      });
    }, { allowSignalWrites: true });
  }

  // Categories for the select
  public readonly categoryResource = rxResource({
    stream: () => this.categoryService.getAll(),
  });

  public readonly categoryOptions = computed(() => {
    const categories = this.categoryResource.value()?.data || [];
    const products = this.productResource.value()?.data || [];

    // Filter categories that have at least one product
    return categories
      .filter((c) => products.some((p) => p.category?.id == c.id))
      .map((c) => ({
        label: c.nome,
        value: c.id,
      }));
  });

  // Products for the select
  public readonly productResource = rxResource({
    stream: () => this.productService.getAll(),
  });

  public readonly hasProducts = computed(() => {
    return (this.productResource.value()?.data?.length || 0) > 0;
  });

  public readonly origemOptions = signal([
    { label: 'iFood', value: 'IFOOD' },
    { label: 'Condomínio', value: 'CONDOMINIO' },
    { label: 'Escola', value: 'ESCOLA' },
    { label: 'Outros', value: 'OUTROS' },
  ]);

  // Items State
  public readonly selectedCategoryId = signal<number | null>(null);
  public readonly selectedProductId = signal<number | null>(null);

  public readonly productOptions = computed(() => {
    const products = this.productResource.value()?.data || [];
    const categoryId = this.selectedCategoryId();

    return products
      .filter((p) => !categoryId || p.category?.id == categoryId)
      .map((p) => ({
        label: p.name,
        value: p.id,
        product: p,
      }));
  });
  public readonly selectedQuantity = signal<number>(1);
  public readonly saleItems = signal<SaleItemDraft[]>([]); // items added to the sale
  
  public readonly totalSalePrice = computed(() => {
    return this.saleItems().reduce((acc, curr) => acc + (curr.sellPrice * curr.quantity), 0);
  });

  public readonly canAddItem = computed(() => {
    return !!this.selectedProductId() && this.selectedQuantity() > 0;
  });

  public readonly canSubmit = computed(() => {
    const form = this.registerForm.registerForm();
    const hasItems = this.saleItems().length > 0;
    const isFormValid = form.valid();
    const values = form.value();
    const hasOrigem = !!values.origem?.trim();
    const hasDate = !!values.sellDate;

    return hasItems && isFormValid && hasOrigem && hasDate;
  });

  public clearItems(): void {
    this.saleItems.set([]);
  }

  public addItem(): void {
    console.log('addItem called');
    const productId = this.selectedProductId();
    const quantity = this.selectedQuantity();

    console.log('productId:', productId, 'type:', typeof productId);
    console.log('quantity:', quantity, 'type:', typeof quantity);

    if (!productId || quantity <= 0) {
      console.warn('Invalid productId or quantity');
      this.toast({
        title: 'Erro',
        message: 'Selecione um produto e uma quantidade válida',
        type: 'error',
      });
      return;
    }

    const options = this.productOptions();
    console.log('productOptions length:', options.length);

    const option = options.find((p) => String(p.value) === String(productId));
    const product = option?.product;

    if (!product) {
      console.warn('Product not found for id:', productId);
      this.toast({
        title: 'Erro',
        message: 'Produto não encontrado',
        type: 'error',
      });
      return;
    }

    console.log('Found product:', product.name);

    this.saleItems.update((items) => {
      const existing = items.find((i) => String(i.productId) === String(productId));
      if (existing) {
        existing.quantity += quantity;
        return [...items];
      }
      return [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          sellPrice: this.registerForm.registerForm().value().origem === 'IFOOD' && product.ifoodSellPrice 
                        ? product.ifoodSellPrice 
                        : product.sellPrice,
          quantity,
          product,
        },
      ];
    });

    console.log('saleItems updated, new length:', this.saleItems().length);

    // Reset item form
    this.selectedProductId.set(null);
    this.selectedQuantity.set(1);
  }

  public removeItem(index: number): void {
    this.saleItems.update((items) => {
      items.splice(index, 1);
      return [...items];
    });
  }

  public submit(): void {
    const form = this.registerForm.registerForm;
    form().markAsTouched();

    if (!form().valid() || !form().value().origem?.trim() || !form().value().sellDate) {
       this.toast({
        title: 'Erro ao cadastrar venda',
        message: 'Preencha os campos obrigatórios (Origem e Data)',
        type: 'error',
       });
      return;
    }

    if (this.saleItems().length === 0) {
      this.toast({
        title: 'Erro ao cadastrar venda',
        message: 'A venda deve possuir pelo menos um produto',
        type: 'error',
       });
      return;
    }

    this.registerForm.isSubmitting.set(true);

    const payload = {
      origem: form().value().origem as SaleOrigin,
      sellDate: new Date(form().value().sellDate).toISOString(),
      items: this.saleItems().map((i): SaleItemRequest => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    this.service.create(payload).subscribe({
      next: () => {
        this.toast({
          title: 'Sucesso ao cadastrar venda',
          message: 'Venda cadastrada com sucesso',
          type: 'success',
        });
        this.registerForm.resetForm();
        this.saleItems.set([]);
        this.router.navigate(['/dashboard/venda']);
      },
      error: () => {
        this.toast({
          title: 'Erro ao cadastrar venda',
          message: 'Erro ao cadastrar venda',
          type: 'error',
         });
      },
      complete: () => {
        this.registerForm.isSubmitting.set(false);
      },
    });
  }

  private toast(toast: ToastModel): void {
    this.store.dispatch(new OpenToast(toast));
  }

  public cancel(): void {
    this.router.navigate(['/dashboard/venda']);
  }
}
