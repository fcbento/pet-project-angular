import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from '../category.service';

import { CommonModule, DatePipe } from '@angular/common';
import { Table } from '../../../ui/table/table';
import { FormInput } from '../../../ui/form-input/form-input';
import { Button } from '../../../ui/button/button';
import { SummaryCard } from '../../../ui/summary-card/summary-card';
import { Store } from '@ngxs/store';
import { OpenToast } from '../../../utility/store/toast/toast.actions';
import { CategoryResponse } from './list.models';

@Component({
  selector: 'app-list',
  imports: [Table, FormInput, Button, CommonModule, SummaryCard],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  providers: [DatePipe],
})
export class List {
  private readonly service = inject(CategoryService);
  private readonly datePipe = inject(DatePipe);
  private readonly store = inject(Store);
  public readonly updateTable = input<unknown>();

  public readonly updateTableSignal = effect(() => {
    this.updateTable();
    this.categoryResource.reload();
  });

  public readonly categoryResource = rxResource({
    stream: () => this.service.getAll(),
  });

  // Filters
  public readonly nameFilter = signal('');

  public readonly categories = computed(() => {
    let data = this.categoryResource.value()?.data || [];

    const name = this.nameFilter().toLowerCase();

    if (name) {
      data = data.filter((item) => item.nome?.toLowerCase().includes(name));
    }

    return data;
  });

  // Derived Summary
  public readonly summary = computed(() => {
    const list = this.categories();
    return {
      totalCategories: list.length,
    };
  });

  public clearFilters(): void {
    this.nameFilter.set('');
  }

  public readonly columns = [
    { label: 'Nome', field: 'nome', sortable: true },
    { label: 'Criado por', field: 'criadoPor' },
    {
      label: 'Criado em',
      field: 'createdAt',
      cell: (row: CategoryResponse) => this.datePipe.transform(new Date(row.createdAt), 'dd/MM/yyyy HH:mm:ss'),
    },
  ];

  public readonly rowActions = [
    {
      label: 'Excluir',
      icon: '🗑️',
      callback: (row: CategoryResponse) => this.delete(row),
    },
  ];

  public onRowsSelected = (rows: CategoryResponse[]): void => {
    console.log('selecionados', rows);
  };

  private delete(row: CategoryResponse): void {
    if (confirm(`Deseja realmente excluir a categoria "${row.nome}"?`)) {
      this.service.delete(row.id).subscribe({
        next: (response) => {
          this.store.dispatch(
            new OpenToast({
              title: 'Sucesso',
              message: response.message || 'Categoria excluída com sucesso',
              type: 'success',
            })
          );
          this.categoryResource.reload();
        },
        error: (err) => {
          this.store.dispatch(
            new OpenToast({
              title: 'Erro',
              message: err.error?.message || 'Erro ao excluir categoria',
              type: 'error',
            })
          );
        },
      });
    }
  }
}
