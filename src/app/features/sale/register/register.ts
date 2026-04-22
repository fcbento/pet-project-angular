import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
import { SaleService } from '../sale.service';
import { SaleRegisterForm } from './register.form';

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
  private readonly router = inject(Router);
  public readonly registerForm = inject(SaleRegisterForm);
  public readonly store = inject(Store);

  // Products for the select
  public readonly productResource = rxResource({
    stream: () => this.productService.getAll(),
  });

  public readonly productOptions = computed(() => {
    const products = this.productResource.value()?.data || [];
    return products.map((p) => ({
      label: p.name,
      value: p.id,
      product: p, // keep full object to show price
    }));
  });

  // Items State
  public readonly selectedProductId = signal<number | null>(null);
  public readonly selectedQuantity = signal<number>(1);
  public readonly saleItems = signal<any[]>([]); // items added to the sale
  
  public readonly totalSalePrice = computed(() => {
    return this.saleItems().reduce((acc, curr) => acc + (curr.sellPrice * curr.quantity), 0);
  });

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
          sellPrice: product.sellPrice,
          quantity,
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

    if (!form().valid) {
       this.toast({
        title: 'Erro ao cadastrar venda',
        message: 'Preencha os campos obrigatórios',
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
      origem: form().value().origem,
      sellDate: new Date(form().value().sellDate).toISOString(),
      items: this.saleItems().map((i) => ({
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
