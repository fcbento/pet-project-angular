import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PromocoesService } from '../promocoes.service';
import { TableAction } from '../../../ui/table/table.model';
import { ProductResponse } from '../../product/list/list.models';
import { CategoryService } from '../../category/category.service';
import { ProductService } from '../../product/product.service';
import { Modal } from '../../../ui/modal/modal';
import { Badge } from '../../../ui/badge/badge';
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
  imports: [CommonModule, FormSelect, FormInput, Button, Table, Card, Field, ConfirmDialog, Modal, Badge],
  templateUrl: './combo-register.html',
  styleUrl: './combo-register.scss',
  providers: [ComboForm, CurrencyPipe]
})
export class ComboRegister {
  public readonly registerForm = inject(ComboForm);
  private readonly promocoesService = inject(PromocoesService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly store = inject(Store);
  private readonly currencyPipe = inject(CurrencyPipe);
  
  public readonly isDeleteDialogOpen = signal(false);
  public readonly comboToDelete = signal<number | null>(null);

  public readonly isEditMode = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly isDetailsModalOpen = signal(false);
  public readonly selectedComboDetails = signal<any>(null);

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
    const ifoodMargin = ifoodPrice > 0 ? ((ifoodPrice * 0.72 - cost) / (ifoodPrice * 0.72)) * 100 : 0;

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
      if (this.isEditMode() && this.editingId()) {
        await lastValueFrom(this.promocoesService.updateCombo(this.editingId()!, request));
        this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Combo atualizado com sucesso!', type: 'success' }));
      } else {
        await lastValueFrom(this.promocoesService.createCombo(request));
        this.store.dispatch(new OpenToast({ title: 'Sucesso', message: 'Combo criado com sucesso!', type: 'success' }));
      }
      this.activeCombos.reload();
      this.resetForm();
    } catch (e) {
      this.store.dispatch(new OpenToast({ title: 'Erro', message: 'Erro ao processar combo', type: 'error' }));
    }
  }

  public readonly tableActions: TableAction<ProductResponse>[] = [
    {
      label: 'Detalhes',
      callback: (row: any) => this.showDetails(row),
      icon: '👁️'
    },
    {
      label: 'Editar',
      callback: (row: any) => this.onEdit(row),
      icon: '✏️'
    },
    {
      label: 'Excluir',
      callback: (row: any) => this.removeCombo(row.id!),
      icon: '🗑️'
    }
  ];

  public showDetails(row: any): void {
    const allProducts = this.allProducts.value() || [];
    const items = (row.items || []).map((it: any) => {
      const product = allProducts.find(p => p.id === it.productId);
      return {
        ...it,
        productName: product?.name || 'Produto não encontrado',
        costPrice: product?.costPrice || 0,
        sellPrice: product?.sellPrice || 0,
        ifoodSellPrice: product?.ifoodSellPrice || 0
      };
    });

    const totalCost = items.reduce((acc: number, it: any) => acc + (it.costPrice * it.quantity), 0);
    const ifoodFee = row.ifoodSellPrice * 0.28;
    const profitBalcao = row.sellPrice - totalCost;
    const profitIfood = (row.ifoodSellPrice * 0.72) - totalCost;
    const grossMargin = row.sellPrice > 0 ? ((row.sellPrice - totalCost) / row.sellPrice) * 100 : 0;
    const ifoodMargin = row.ifoodSellPrice > 0 ? ((row.ifoodSellPrice * 0.72 - totalCost) / (row.ifoodSellPrice * 0.72)) * 100 : 0;

    this.selectedComboDetails.set({
      ...row,
      itemsWithDetails: items,
      totalCost,
      ifoodFee,
      profitBalcao,
      profitIfood,
      grossMargin,
      ifoodMargin
    });
    this.isDetailsModalOpen.set(true);
  }
  
  public readonly columns = [
    { field: 'name', label: 'Nome' },
    { 
      field: 'sellPrice', 
      label: 'Balcão',
      cell: (row: any) => this.currencyPipe.transform(row.sellPrice, 'BRL', 'symbol', '1.2-2') || '-'
    },
    { 
      field: 'ifoodSellPrice', 
      label: 'iFood',
      cell: (row: any) => this.currencyPipe.transform(row.ifoodSellPrice, 'BRL', 'symbol', '1.2-2') || '-'
    },
    { 
      field: 'costPrice', 
      label: 'Custo',
      cell: (row: any) => this.currencyPipe.transform(row.costPrice, 'BRL', 'symbol', '1.2-2') || '-'
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
    } catch (e: any) {
      const message = e.error?.message || 'Erro ao excluir combo';
      this.store.dispatch(new OpenToast({ title: 'Erro', message, type: 'error' }));
    }
  }

  public onEdit(row: any): void {
    this.isEditMode.set(true);
    this.editingId.set(row.id);

    this.registerForm.model.update(m => ({
      ...m,
      name: row.name,
      sellPrice: row.sellPrice,
      ifoodSellPrice: row.ifoodSellPrice
    }));

    const allProducts = this.allProducts.value() || [];
    const items = (row.items || []).map((it: any) => {
      const product = allProducts.find(p => p.id === it.productId);
      return {
        productId: it.productId,
        productName: product?.name || 'Produto não encontrado',
        quantity: it.quantity,
        costPrice: product?.costPrice || 0,
        sellPrice: product?.sellPrice || 0,
        ifoodSellPrice: product?.ifoodSellPrice || 0
      };
    });

    this.comboItems.set(items);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.registerForm.reset();
    this.comboItems.set([]);
    this.isEditMode.set(false);
    this.editingId.set(null);
  }
}
