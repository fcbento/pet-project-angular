import { DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Table } from '../../../ui/table/table';
import { ProductService } from '../product.service';
import { CategoryService } from '../../category/category.service';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { Button } from '../../../ui/button/button';
import { SummaryCard } from '../../../ui/summary-card/summary-card';
import { ProductResponse } from './list.models';
import { Store } from '@ngxs/store';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-product-list',
  imports: [Table, FormInput, FormSelect, Button, CommonModule, SummaryCard, ConfirmDialog],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  providers: [DatePipe, CurrencyPipe],
})
export class ProductList {
  private readonly service = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  public readonly updateTable = input<unknown>();

  public readonly updateTableSignal = effect(() => {
    this.updateTable();
    this.productResource.reload();
  });

  public readonly productResource = rxResource({
    stream: () => this.service.getAll(),
  });

  public readonly categoryResource = rxResource({
    stream: () => this.categoryService.getAll(),
  });

  // Filters
  public readonly nameFilter = signal('');
  public readonly categoryFilter = signal<string>('');

  // Dialog State
  public readonly isDeleteDialogOpen = signal(false);
  public readonly productToDelete = signal<ProductResponse | null>(null);

  public readonly categoryOptions = computed(() => {
    const categories = this.categoryResource.value()?.data || [];
    return categories.map((c) => ({
      label: c.nome,
      value: c.id.toString(),
    }));
  });

  public readonly products = computed(() => {
    let data = this.productResource.value()?.data || [];

    const name = this.nameFilter().toLowerCase();
    const categoryId = this.categoryFilter();

    if (name) {
      data = data.filter((item) => item.name?.toLowerCase().includes(name));
    }

    if (categoryId) {
      data = data.filter((item) => item.category?.id?.toString() === categoryId);
    }

    return data;
  });

  // Derived Summary
  public readonly summary = computed(() => {
    const list = this.products();
    
    const totals = list.reduce((acc, p) => {
      const stock = p.stockQuantity || 0;
      
      // Balcao
      const revBalcao = p.sellPrice * stock;
      const profitBalcao = (p.sellPrice - p.costPrice) * stock;
      
      // iFood
      const fee = p.marketplaceFee || 28;
      const multiplier = (1 - (fee / 100));
      const netRevIfood = (p.ifoodSellPrice * multiplier) * stock;
      const profitIfood = netRevIfood - (p.costPrice * stock);
      const grossRevIfood = p.ifoodSellPrice * stock;
      
      // Revenda
      const revResale = p.hasResale ? (p.resalePrice * stock) : 0;
      const profitResale = p.hasResale ? (p.resalePrice - p.costPrice) * stock : 0;
      
      acc.units += stock;
      acc.revBalcao += revBalcao;
      acc.profitBalcao += profitBalcao;
      acc.revIfood += grossRevIfood;
      acc.netRevIfood += netRevIfood;
      acc.profitIfood += profitIfood;
      acc.revResale += revResale;
      acc.profitResale += profitResale;
      
      return acc;
    }, { units: 0, revBalcao: 0, profitBalcao: 0, revIfood: 0, netRevIfood: 0, profitIfood: 0, revResale: 0, profitResale: 0 });

    const marginBalcao = totals.revBalcao > 0 ? (totals.profitBalcao / totals.revBalcao) * 100 : 0;
    const marginIfood = totals.netRevIfood > 0 ? (totals.profitIfood / totals.netRevIfood) * 100 : 0;
    const marginResale = totals.revResale > 0 ? (totals.profitResale / totals.revResale) * 100 : 0;

    return {
      units: totals.units,
      balcao: [
        { label: 'Faturamento Potencial', value: totals.revBalcao, type: 'currency' },
        { label: 'Margem Média', value: marginBalcao, type: 'percentage' }
      ] as const,
      balcaoProfit: totals.profitBalcao,
      ifood: [
        { label: 'Faturamento Potencial', value: totals.revIfood, type: 'currency' },
        { label: 'Margem Média', value: marginIfood, type: 'percentage' }
      ] as const,
      ifoodProfit: totals.profitIfood,
      resale: [
        { label: 'Faturamento Potencial', value: totals.revResale, type: 'currency' },
        { label: 'Margem Média', value: marginResale, type: 'percentage' }
      ] as const,
      resaleProfit: totals.profitResale
    };
  });

  public clearFilters(): void {
    this.nameFilter.set('');
    this.categoryFilter.set('');
  }

  public readonly columns = computed(() => {
    const products = this.products();
    const hasFinancials = products.some((p) => p.costPrice > 0 || p.sellPrice > 0);

    const baseColumns = [
      { label: 'Nome', field: 'name', sortable: true },
      { label: 'Categoria', field: 'category', cell: (row: ProductResponse) => row.category?.nome || '-' },
    ];

    const financialColumns = hasFinancials
      ? [
        {
          label: 'Custo',
          field: 'costPrice',
          cell: (row: ProductResponse) =>
            row.costPrice ? this.currencyPipe.transform(row.costPrice, 'BRL', 'symbol', '1.2-2') : '-',
        },
        {
          label: 'Venda Balcão',
          field: 'sellPrice',
          cell: (row: ProductResponse) =>
            row.sellPrice ? this.currencyPipe.transform(row.sellPrice, 'BRL', 'symbol', '1.2-2') : '-',
        },
        {
          label: 'Lucro Balcão',
          field: 'profit',
          cell: (row: ProductResponse) =>
            row.profit ? this.currencyPipe.transform(row.profit, 'BRL', 'symbol', '1.2-2') : '-',
        },
        {
          label: 'Margem Balcão',
          field: 'profitMargin',
          cell: (row: ProductResponse) => {
            if (!row.sellPrice || !row.costPrice) return '-';
            const profit = row.sellPrice - row.costPrice;
            const margin = (profit / row.sellPrice) * 100;
            return `${margin.toFixed(2)}%`;
          },
        },
        {
          label: 'Preço Revenda',
          field: 'resalePrice',
          cell: (row: ProductResponse) =>
            row.hasResale && row.resalePrice ? this.currencyPipe.transform(row.resalePrice, 'BRL', 'symbol', '1.2-2') : '-',
        },
        {
          label: 'Venda iFood',
          field: 'ifoodSellPrice',
          cell: (row: ProductResponse) =>
            row.ifoodSellPrice ? this.currencyPipe.transform(row.ifoodSellPrice, 'BRL', 'symbol', '1.2-2') : '-',
        },
        {
          label: 'Lucro iFood',
          field: 'ifoodProfit',
          cell: (row: ProductResponse) => {
            if (!row.ifoodSellPrice || !row.costPrice) return '-';
            const fee = row.marketplaceFee || 28;
            const multiplier = (1 - (fee / 100));
            const ifoodProfit = (row.ifoodSellPrice * multiplier) - row.costPrice;
            return this.currencyPipe.transform(ifoodProfit, 'BRL', 'symbol', '1.2-2');
          },
        },
        {
          label: 'Margem iFood',
          field: 'ifoodProfitMargin',
          cell: (row: ProductResponse) => {
            if (!row.ifoodSellPrice || !row.costPrice) return '-';
            const fee = row.marketplaceFee || 28;
            const multiplier = (1 - (fee / 100));
            const ifoodNetRevenue = row.ifoodSellPrice * multiplier;
            const ifoodProfit = ifoodNetRevenue - row.costPrice;
            const margin = (ifoodProfit / ifoodNetRevenue) * 100;
            return `${margin.toFixed(2)}%`;
          },
        },
      ]
      : [];

    return [...baseColumns, ...financialColumns];
  });

  public readonly rowActions = [
    {
      label: 'Ficha',
      icon: '📋',
      callback: (row: ProductResponse) => this.fichaTecnica(row),
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      callback: (row: ProductResponse) => this.delete(row),
    },
  ];

  private fichaTecnica(row: ProductResponse): void {
    this.router.navigate(['/dashboard/produto/ficha-tecnica'], {
      queryParams: { productId: row.id },
    });
  }

  public onRowsSelected = (rows: ProductResponse[]): void => {
    console.log('selecionados', rows);
  };

  public delete(row: ProductResponse): void {
    this.productToDelete.set(row);
    this.isDeleteDialogOpen.set(true);
  }

  public confirmDelete(): void {
    const row = this.productToDelete();
    if (!row) return;

    this.service.delete(row.id).subscribe({
      next: () => {
        this.store.dispatch(new OpenToast({
          title: 'Sucesso',
          message: 'Produto excluído com sucesso',
          type: 'success'
        }));
        this.productResource.reload();
      },
      error: (err) => {
        if (err.status === 409) {
          this.store.dispatch(new OpenToast({
            title: 'Não é possível excluir',
            message: err.error?.message || 'Este produto possui vendas cadastradas e não pode ser removido.',
            type: 'warning'
          }));
        } else {
          this.store.dispatch(new OpenToast({
            title: 'Erro ao excluir',
            message: 'Ocorreu um erro ao tentar excluir o produto.',
            type: 'error'
          }));
        }
      }
    });
  }

  public onRowClick(row: ProductResponse): void {
    this.fichaTecnica(row);
  }
}
