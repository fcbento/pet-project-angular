import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { Button } from '../button/button';
import { Card } from '../card/card';
import { TableAction, TableColumn } from './table.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, Card, Button],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table<T> {
  public readonly columns = input.required<TableColumn<T>[]>();
  public readonly data = input.required<T[]>();
  public readonly actions = input<TableAction<T>[]>();
  public readonly withPagination = input<boolean>(false);
  public readonly pageSizeOptions = input<number[]>([10, 50, 100]);
  public readonly title = input<string>();
  public readonly subtitle = input<string>();
  private readonly _selected = signal<Set<T>>(new Set());
  public readonly selectedCount = computed(() => this._selected().size);
  public readonly allSelected = computed(
    () => this.data().length > 0 && this._selected().size === this.data().length,
  );

  public readonly allPageSelected = computed(() => {
    const items = this.currentPageData();
    return items.length > 0 && items.every((r) => this._selected().has(r));
  });

  public readonly selectedRows = computed(() => Array.from(this._selected()));

  public readonly sortField = signal<keyof T | string | null>(null);
  public readonly sortDirection = signal<'asc' | 'desc'>('asc');

  public readonly page = signal(1);
  public readonly pageSize = signal(10);
  public readonly pageCount = computed(() => {
    if (!this.withPagination()) return 1;
    return Math.ceil(this.sortedData().length / this.pageSize());
  });

  public readonly actionMenuFor = signal<T | null>(null);

  public cellValue(row: T, field: keyof T | string): unknown {
    return (row as Record<string, unknown>)[field as string];
  }

  public readonly sortedData = computed(() => {
    const arr = [...this.data()];
    const field = this.sortField() as string;
    const dir = this.sortDirection();
    if (!field) {
      return arr;
    }
    arr.sort((a, b) => {
      const va = (a as Record<string, unknown>)[field];
      const vb = (b as Record<string, unknown>)[field];
      if (va == null && vb == null) return 0;
      if (va == null) return dir === 'asc' ? -1 : 1;
      if (vb == null) return dir === 'asc' ? 1 : -1;
      
      if (typeof va === 'string' && typeof vb === 'string') {
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }

      if ((va as number) < (vb as number)) return dir === 'asc' ? -1 : 1;
      if ((va as number) > (vb as number)) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  });

  public readonly currentPageData = computed(() => {
    const sd = this.sortedData();
    if (!this.withPagination()) {
      return sd;
    }
    const start = (this.page() - 1) * this.pageSize();
    return sd.slice(start, start + this.pageSize());
  });

  private readonly _resetPage = effect(() => {
    if (this.page() > this.pageCount()) {
      this.page.set(1);
    }
  });

  public readonly selectionChange = output<T[]>();
  public readonly rowClick = output<T>();
  private readonly _selectionEffect = effect(() => {
    this.selectionChange.emit(this.selectedRows());
  });

  public isSelected(row: T): boolean {
    return this._selected().has(row);
  }

  public toggleRow(row: T): void {
    const set = new Set(this._selected());
    if (set.has(row)) {
      set.delete(row);
    } else {
      set.add(row);
    }
    this._selected.set(set);
  }

  public toggleAll(): void {
    if (this.allSelected()) {
      this._selected.set(new Set());
    } else {
      this._selected.set(new Set(this.data()));
    }
  }

  public togglePage(): void {
    const items = this.currentPageData();
    const set = new Set(this._selected());
    const allPage = items.every((r) => set.has(r));
    if (allPage) {
      items.forEach((r) => set.delete(r));
    } else {
      items.forEach((r) => set.add(r));
    }
    this._selected.set(set);
  }

  public clearSelection(): void {
    this._selected.set(new Set());
  }

  public sortBy(col: TableColumn<T>): void {
    if (!col.sortable) {
      return;
    }
    const key = col.field;
    if (this.sortField() === key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(key);
      this.sortDirection.set('asc');
    }
  }

  public toggleActionMenu(row: T): void {
    this.actionMenuFor.set(this.actionMenuFor() === row ? null : row);
  }

  public runAction(action: TableAction<T>, row: T, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    action.callback(row);
    this.actionMenuFor.set(null);
  }

  public nextPage(): void {
    if (this.page() < this.pageCount()) {
      this.page.update((p) => p + 1);
    }
  }

  public prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
    }
  }

  public setPageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  public onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setPageSize(Number(target.value));
  }
}
