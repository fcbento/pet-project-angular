import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from '../category.service';

import { DatePipe } from '@angular/common';
import { Table } from '../../../ui/table/table';

@Component({
  selector: 'app-list',
  imports: [Table],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  providers: [DatePipe],
})
export class List {
  private readonly service = inject(CategoryService);
  private readonly datePipe = inject(DatePipe);

  public readonly updateTable = input();

  public readonly updateTableSignal = effect(() => {
    this.updateTable();
    this.categoryResource.reload();
  });

  public readonly categoryResource = rxResource({
    stream: () => this.service.getAll(),
  });

  public readonly categories = computed(() => this.categoryResource.value()?.data || []);

  public readonly columns = [
    { label: 'Nome', field: 'nome', sortable: true },
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
    console.log('delete', row);
  }
}
