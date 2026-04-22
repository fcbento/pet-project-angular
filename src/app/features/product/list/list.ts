import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Table } from '../../../ui/table/table';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-list',
  imports: [Table],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  providers: [DatePipe, CurrencyPipe],
})
export class ProductList {
  private readonly service = inject(ProductService);
  private readonly datePipe = inject(DatePipe);
  private readonly currencyPipe = inject(CurrencyPipe);

  public readonly updateTable = input<any>();

  public readonly updateTableSignal = effect(() => {
    this.updateTable();
    this.productResource.reload();
  });

  public readonly productResource = rxResource({
    stream: () => this.service.getAll(),
  });

  public readonly products = computed(() => this.productResource.value()?.data || []);

  public readonly columns = [
    { label: 'Nome', field: 'name', sortable: true },
    { label: 'Categoria', field: 'category', cell: (row: any) => row.category?.nome || '-' },
    {
      label: 'Preço Custo',
      field: 'costPrice',
      cell: (row: any) => this.currencyPipe.transform(row.costPrice, 'BRL', 'symbol', '1.2-2'),
    },
    {
      label: 'Preço Venda',
      field: 'sellPrice',
      cell: (row: any) => this.currencyPipe.transform(row.sellPrice, 'BRL', 'symbol', '1.2-2'),
    },
    {
      label: 'Lucro',
      field: 'profit',
      cell: (row: any) => this.currencyPipe.transform(row.profit, 'BRL', 'symbol', '1.2-2'),
    },
    { label: 'Criado por', field: 'criadoPor' },
    {
      label: 'Criado em',
      field: 'createdAt',
      cell: (row: any) => this.datePipe.transform(new Date(row.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    },
  ];

  public readonly rowActions = [
    {
      label: 'Excluir',
      callback: (row: any) => this.delete(row),
    },
    {
      label: 'Editar',
      callback: (row: any) => this.edit(row),
    },
  ];

  public onRowsSelected = (rows: any[]): void => {
    console.log('selecionados', rows);
  };

  private edit(row: any): void {
    console.log('edit', row);
  }

  private delete(row: any): void {
    if (confirm(`Deseja realmente excluir o produto ${row.name}?`)) {
      this.service.delete(row.id).subscribe(() => {
        this.productResource.reload();
      });
    }
  }
}
