import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Button } from '../../../ui/button/button';
import { FormDate } from '../../../ui/form-date/form-date';
import { FormSelect } from '../../../ui/form-select/form-select';
import { Table } from '../../../ui/table/table';
import { SummaryCard } from '../../../ui/summary-card/summary-card';
import { SaleService } from '../sale.service';
import { SaleResponse } from '../sale.models';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-sale-list',
  imports: [Table, FormDate, FormSelect, Button, CommonModule, SummaryCard, ConfirmDialog],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  providers: [DatePipe, CurrencyPipe],
})
export class SaleList {
  private readonly service = inject(SaleService);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly router = inject(Router);

  public readonly updateTable = input<unknown>();

  public readonly updateTableSignal = effect(() => {
    this.updateTable();
    this.saleResource.reload();
  });

  public readonly saleResource = rxResource({
    stream: () => this.service.getAll(),
  });

  // Filters
  public readonly origemFilter = signal('');
  public readonly startDateFilter = signal('');
  public readonly endDateFilter = signal('');

  // Dialog State
  public readonly isDeleteDialogOpen = signal(false);
  public readonly saleToDelete = signal<SaleResponse | null>(null);

  public readonly origemOptions = computed(() => {
    const data = this.saleResource.value()?.data || [];
    const origens = [...new Set(data.map((s) => s.origem))];
    return origens.map((o) => ({ label: o, value: o }));
  });

  public readonly sales = computed(() => {
    let data = this.saleResource.value()?.data || [];

    const origem = this.origemFilter();
    const startDate = this.startDateFilter();
    const endDate = this.endDateFilter();

    if (origem) {
      data = data.filter((s) => s.origem === origem);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      data = data.filter((s) => new Date(s.sellDate).getTime() >= start);
    }

    if (endDate) {
      // Include the whole end date by adding 24 hours minus 1 ms
      const end = new Date(endDate).getTime() + 86399999;
      data = data.filter((s) => new Date(s.sellDate).getTime() <= end);
    }

    return data;
  });

  // Derived Summary
  public readonly summary = computed(() => {
    const list = this.sales();
    const totalPrice = list.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalProfit = list.reduce((acc, curr) => acc + curr.totalProfit, 0);
    const profitMargin = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;

    return {
      totalSell: list.length,
      totalPrice,
      totalProfit,
      profitMargin,
    };
  });

  public readonly columns = [
    { 
      label: 'Origem', 
      field: 'origem', 
      sortable: true,
      cell: (row: SaleResponse) => row.origem === 'IFOOD' ? '🔴 iFood' : row.origem
    },
    {
      label: 'Data Venda',
      field: 'sellDate',
      cell: (row: SaleResponse) => this.datePipe.transform(new Date(row.sellDate), 'dd/MM/yyyy'),
    },
    {
      label: 'Preço Total',
      field: 'totalPrice',
      cell: (row: SaleResponse) => this.currencyPipe.transform(row.totalPrice, 'BRL', 'symbol', '1.2-2'),
    },
    {
      label: 'Lucro Líquido',
      field: 'totalProfit',
      cell: (row: SaleResponse) => this.currencyPipe.transform(row.totalProfit, 'BRL', 'symbol', '1.2-2'),
    },
    {
      label: 'Margem',
      field: 'profitMargin',
      cell: (row: SaleResponse) => `${row.profitMargin?.toFixed(2)}%`,
    },
    {
      label: 'Criado em',
      field: 'createdAt',
      cell: (row: SaleResponse) => this.datePipe.transform(new Date(row.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    },
  ];

  public readonly rowActions = [
    {
      label: 'Excluir',
      icon: '🗑️',
      callback: (row: SaleResponse) => this.delete(row),
    },
  ];

  public onRowsSelected = (rows: SaleResponse[]): void => {
    console.log('selecionados', rows);
  };

  public delete(row: SaleResponse): void {
    this.saleToDelete.set(row);
    this.isDeleteDialogOpen.set(true);
  }

  public confirmDelete(): void {
    const row = this.saleToDelete();
    if (!row) return;

    this.service.delete(row.id).subscribe(() => {
      this.saleResource.reload();
      this.isDeleteDialogOpen.set(false);
    });
  }

  public clearFilters(): void {
    this.origemFilter.set('');
    this.startDateFilter.set('');
    this.endDateFilter.set('');
  }

  public newSale(): void {
    this.router.navigate(['/dashboard/venda/register']);
  }
}
