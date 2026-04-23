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

@Component({
  selector: 'app-product-list',
  imports: [Table, FormInput, FormSelect, Button, CommonModule, SummaryCard],
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
    return {
      totalProducts: list.length,
      totalValue: list.reduce((acc, curr) => acc + curr.sellPrice, 0),
      totalProfit: list.reduce((acc, curr) => acc + curr.profit, 0),
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
            label: 'Preço Custo',
            field: 'costPrice',
            cell: (row: ProductResponse) =>
              row.costPrice ? this.currencyPipe.transform(row.costPrice, 'BRL', 'symbol', '1.2-2') : '-',
          },
          {
            label: 'Preço Venda',
            field: 'sellPrice',
            cell: (row: ProductResponse) =>
              row.sellPrice ? this.currencyPipe.transform(row.sellPrice, 'BRL', 'symbol', '1.2-2') : '-',
          },
          {
            label: 'Venda iFood',
            field: 'ifoodSellPrice',
            cell: (row: ProductResponse) =>
              row.ifoodSellPrice ? this.currencyPipe.transform(row.ifoodSellPrice, 'BRL', 'symbol', '1.2-2') : '-',
          },
          {
            label: 'Lucro',
            field: 'profit',
            cell: (row: ProductResponse) =>
              row.profit ? this.currencyPipe.transform(row.profit, 'BRL', 'symbol', '1.2-2') : '-',
          },
          {
            label: 'Margem',
            field: 'profitMargin',
            cell: (row: ProductResponse) => {
              if (!row.sellPrice) return '-';
              const margin = (row.profit / row.sellPrice) * 100;
              return `${margin.toFixed(2)}%`;
            },
          },
          {
            label: 'Margem iFood',
            field: 'ifoodProfitMargin',
            cell: (row: ProductResponse) => {
              if (!row.ifoodSellPrice || !row.costPrice) return '-';
              // Lucro iFood = (Preço iFood * 0.72) - Custo
              const ifoodProfit = (row.ifoodSellPrice * 0.72) - row.costPrice;
              const margin = (ifoodProfit / row.ifoodSellPrice) * 100;
              return `${margin.toFixed(2)}%`;
            },
          },
        ]
      : [];

    const metaColumns = [
      { label: 'Criado por', field: 'criadoPor' },
      {
        label: 'Criado em',
        field: 'createdAt',
        cell: (row: ProductResponse) => this.datePipe.transform(new Date(row.createdAt), 'dd/MM/yyyy HH:mm:ss'),
      },
    ];

    return [...baseColumns, ...financialColumns, ...metaColumns];
  });

  public readonly rowActions = [
    {
      label: 'Ficha Técnica',
      callback: (row: ProductResponse) => this.fichaTecnica(row),
    },
    {
      label: 'Excluir',
      callback: (row: ProductResponse) => this.delete(row),
    },
    {
      label: 'Editar',
      callback: (row: ProductResponse) => this.edit(row),
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

  private edit(row: ProductResponse): void {
    console.log('edit', row);
  }

  private delete(row: ProductResponse): void {
    if (confirm(`Deseja realmente excluir o produto ${row.name}?`)) {
      this.service.delete(row.id).subscribe(() => {
        this.productResource.reload();
      });
    }
  }

  public onRowClick(row: ProductResponse): void {
    this.fichaTecnica(row);
  }
}
