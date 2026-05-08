import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromocoesService, PromotionResponse } from '../promocoes.service';
import { TableAction } from '../../../ui/table/table.model';
import { CategoryService } from '../../category/category.service';
import { ProductService } from '../../product/product.service';
import { FormSelect } from '../../../ui/form-select/form-select';
import { FormInput } from '../../../ui/form-input/form-input';
import { Button } from '../../../ui/button/button';
import { Table } from '../../../ui/table/table';
import { Card } from '../../../ui/card/card';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { lastValueFrom, map, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { Field } from '@angular/forms/signals';
import { PromotionForm } from '../promotion.form';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse } from '../../../utility/models/api-response.interface';

@Component({
  selector: 'app-promotion-register',
  standalone: true,
  imports: [CommonModule, FormSelect, FormInput, Button, Table, Card, Field, ConfirmDialog],
  templateUrl: './promotion-register.html',
  styleUrl: './promotion-register.scss',
  providers: [PromotionForm]
})
export class PromotionRegister {
  public readonly registerForm = inject(PromotionForm);
  private readonly promocoesService = inject(PromocoesService);
  private readonly categoryService = inject(CategoryService);
  private readonly store = inject(Store);
  private readonly productService = inject(ProductService);
  
  public readonly isDeleteDialogOpen = signal(false);
  public readonly promotionToDelete = signal<number | null>(null);

  public readonly categoriesResource = rxResource({
    stream: () => this.categoryService.getAll().pipe(map(r => r.data))
  });

  public readonly categoryOptions = computed(() => {
    return (this.categoriesResource.value() || [])
      .filter(c => c.nome.toLowerCase() !== 'combo')
      .map(c => ({ label: c.nome, value: c.id }));
  });


  public readonly allProducts = rxResource({
    stream: () => this.productService.getAll().pipe(map(r => r.data))
  });

  public readonly productOptions = computed(() => {
    const categoryId = this.registerForm.model().categoryId;
    const all = this.allProducts.value() || [];
    if (!categoryId) return [];
    return all
      .filter(p => p.category?.id == categoryId)
      .map(p => ({ label: p.name, value: p.id }));
  });

  public readonly products = computed(() => {
    const categoryId = this.registerForm.model().categoryId;
    const all = this.allProducts.value() || [];
    if (!categoryId) return [];
    return all.filter(p => p.category?.id == categoryId);
  });

  public readonly selectedProduct = computed(() => {
    const id = this.registerForm.model().productId;
    return this.products()?.find(p => p.id == id);
  });

  public readonly activePromotions = rxResource<PromotionResponse[], unknown>({
    stream: () => this.promocoesService.listActivePromotions()
  });

  // Cálculos Automáticos
  public readonly currentPrice = computed(() => {
    const p = this.selectedProduct();
    const origin = this.registerForm.model().origin;
    if (!p) return 0;
    if (origin === 'IFOOD') return p.ifoodSellPrice || 0;
    return p.sellPrice || 0;
  });

  public readonly costPrice = computed(() => this.selectedProduct()?.costPrice || 0);

  public readonly currentMargins = computed(() => {
    const price = this.currentPrice();
    const cost = this.costPrice();
    const origin = this.registerForm.model().origin;
    if (price <= 0) return { gross: 0, net: 0 };

    const gross = ((price - cost) / price) * 100;

    // Simplificado conforme regra (R$ 3 se iFood)
    const fee = origin === 'IFOOD' ? 3 : 0;
    const net = ((price - cost - fee) / price) * 100;

    return { gross, net };
  });

  public readonly promoMargins = computed(() => {
    const price = this.registerForm.model().promoPrice || 0;
    const cost = this.costPrice();
    const origin = this.registerForm.model().origin;
    if (price <= 0) return { gross: 0, net: 0, discount: 0 };

    const original = this.currentPrice();
    const discount = original > 0 ? ((original - price) / original) * 100 : 0;
    const gross = ((price - cost) / price) * 100;
    const fee = origin === 'IFOOD' ? 3 : 0;
    const net = ((price - cost - fee) / price) * 100;

    return { gross, net, discount };
  });

  public readonly columns = [
    { field: 'productName', label: 'Produto' },
    { field: 'origin', label: 'Canal' },
    { field: 'originalPrice', label: 'Preço Original', cell: (row: PromotionResponse) => this.formatCurrency(row.originalPrice) },
    { field: 'promoPrice', label: 'Preço Promo', cell: (row: PromotionResponse) => this.formatCurrency(row.promoPrice) },
    {
      field: 'discountPercentage',
      label: 'Desconto',
      cell: (row: PromotionResponse) => {
        const original = row.originalPrice || 0;
        const promo = row.promoPrice || 0;
        const discount = original > 0 ? ((original - promo) / original) * 100 : 0;
        return `${discount.toFixed(2)}%`;
      }
    },
    { field: 'status', label: 'Status' }
  ];

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  public async save(): Promise<void> {
    if (this.registerForm.form().invalid()) return;

    const price = this.registerForm.model().promoPrice || 0;
    if (price < this.costPrice()) {
      const confirm = window.confirm('Atenção: O preço promocional é menor que o custo. Deseja continuar?');
      if (!confirm) return;
    }

    try {
      await lastValueFrom(this.promocoesService.createPromotion(this.registerForm.model() as any));
      this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Promoção criada com sucesso!', type: 'success' }));
      this.activePromotions.reload();
      this.registerForm.reset();
    } catch (e) {
      this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao criar promoção', type: 'error' }));
    }
  }

  public readonly tableActions: TableAction<PromotionResponse>[] = [
    {
      label: 'Remover',
      callback: (row) => this.remove(row.id),
      icon: '🗑️'
    }
  ];

  public remove(id: number): void {
    this.promotionToDelete.set(id);
    this.isDeleteDialogOpen.set(true);
  }

  public async confirmRemove(): Promise<void> {
    const id = this.promotionToDelete();
    if (!id) return;

    try {
      await lastValueFrom(this.promocoesService.removePromotion(id));
      this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Promoção removida', type: 'success' }));
      this.activePromotions.reload();
      this.isDeleteDialogOpen.set(false);
    } catch (e) {
      this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao remover', type: 'error' }));
    }
  }
}
