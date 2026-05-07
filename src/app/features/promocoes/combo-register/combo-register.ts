import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromocoesService } from '../promocoes.service';
import { TableAction } from '../../../ui/table/table.model';
import { ProductResponse } from '../../product/list/list.models';
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
import { ComboForm } from '../combo.form';
import { ReactiveFormsModule } from '@angular/forms';

interface ComboItemSelection {
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  ifoodSellPrice: number;
}

@Component({
  selector: 'app-combo-register',
  standalone: true,
  imports: [CommonModule, FormSelect, FormInput, Button, Table, Card, Field, ConfirmDialog],
  templateUrl: './combo-register.html',
  styleUrl: './combo-register.scss',
  providers: [ComboForm]
})
export class ComboRegister {
  public readonly registerForm = inject(ComboForm);
  private readonly promocoesService = inject(PromocoesService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly store = inject(Store);
  
  public readonly isDeleteDialogOpen = signal(false);
  public readonly comboToDelete = signal<number | null>(null);

  public readonly comboItems = signal<ComboItemSelection[]>([]);

  public readonly categoriesResource = rxResource({
    stream: () => this.categoryService.getAll().pipe(map(r => r.data))
  });

  public readonly categoryOptions = computed(() => {
    return (this.categoriesResource.value() || [])
      .filter(c => c.nome !== 'Combo')
      .map(c => ({ label: c.nome, value: c.id }));
  });


  public readonly allProducts = rxResource({
    stream: () => this.productService.getAll().pipe(map(r => r.data))
  });

  public readonly productsToFilter = computed(() => {
    const categoryId = this.registerForm.model().filterCategoryId;
    const all = this.allProducts.value() || [];
    if (!categoryId) return [];
    return all.filter(p => p.category?.id == categoryId);
  });

  public readonly productOptionsToFilter = computed(() => {
    return this.productsToFilter().map(p => ({ label: p.name, value: p.id }));
  });

  public readonly activeCombos = rxResource({
    stream: () => this.promocoesService.listCombos()
  });

  // Cálculos Totais
  public readonly totalCost = computed(() => {
    return this.comboItems().reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
  });

  public readonly totals = computed(() => {
    const cost = this.totalCost();
    const sellPrice = this.registerForm.model().sellPrice || 0;
    const ifoodPrice = this.registerForm.model().ifoodSellPrice || 0;

    const grossMargin = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;
    const ifoodMargin = ifoodPrice > 0 ? ((ifoodPrice - cost - 3) / ifoodPrice) * 100 : 0;

    return { cost, grossMargin, ifoodMargin };
  });

  public addItem(): void {
    const productId = this.registerForm.model().selectedProductId;
    const qty = this.registerForm.model().selectedQuantity || 1;

    if (!productId) return;

    const product = this.productsToFilter()?.find(p => p.id == productId);
    if (!product) return;

    this.comboItems.update(items => [
      ...items,
      {
        productId: product.id!,
        productName: product.name!,
        quantity: qty,
        costPrice: product.costPrice || 0,
        sellPrice: product.sellPrice || 0,
        ifoodSellPrice: product.ifoodSellPrice || 0
      }
    ]);

    this.registerForm.model.update(m => ({ ...m, selectedProductId: null, selectedQuantity: 1 }));
  }

  public removeItem(index: number): void {
    this.comboItems.update(items => items.filter((_, i) => i !== index));
  }

  public async save(): Promise<void> {
    if (this.registerForm.form().invalid() || this.comboItems().length === 0) {
      this.store.dispatch(new OpenToast({ title: 'Aviso', message: 'Preencha todos os campos e adicione itens ao combo', type: 'warning' }));
      return;
    }

    const request = {
      name: this.registerForm.model().name,
      sellPrice: this.registerForm.model().sellPrice,
      ifoodSellPrice: this.registerForm.model().ifoodSellPrice,
      items: this.comboItems().map(it => ({ productId: it.productId, quantity: it.quantity }))
    };

    try {
      await lastValueFrom(this.promocoesService.createCombo(request));
      this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Combo criado com sucesso!', type: 'success' }));
      this.activeCombos.reload();
      this.resetForm();
    } catch (e) {
      this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao criar combo', type: 'error' }));
    }
  }

  public readonly tableActions: TableAction<ProductResponse>[] = [
    {
      label: 'Excluir',
      callback: (row) => this.removeCombo(row.id!),
      icon: '🗑️'
    }
  ];

  public removeCombo(id: number): void {
    this.comboToDelete.set(id);
    this.isDeleteDialogOpen.set(true);
  }

  public async confirmRemoveCombo(): Promise<void> {
    const id = this.comboToDelete();
    if (!id) return;

    try {
      await lastValueFrom(this.promocoesService.deleteCombo(id));
      this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Combo excluído', type: 'success' }));
      this.activeCombos.reload();
      this.isDeleteDialogOpen.set(false);
    } catch (e) {
      this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao excluir', type: 'error' }));
    }
  }

  private resetForm(): void {
    this.registerForm.reset();
    this.comboItems.set([]);
  }
}
