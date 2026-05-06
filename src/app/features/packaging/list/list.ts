import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { Modal } from '../../../ui/modal/modal';
import { Table } from '../../../ui/table/table';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';
import { TableAction, TableColumn } from '../../../ui/table/table.model';
import { PackagingRequest, PackagingResponse } from '../packaging.model';
import { PackagingService } from '../packaging.service';

@Component({
  selector: 'app-packaging-list',
  standalone: true,
  imports: [CommonModule, Table, Button, FormInput, Modal, ConfirmDialog],
  providers: [CurrencyPipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class PackagingList {
  private readonly packagingService = inject(PackagingService);
  private readonly currencyPipe = inject(CurrencyPipe);

  private readonly refreshTrigger = signal(0);

  public readonly packagings = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.packagingService.findAll())
    ),
    { initialValue: [] as PackagingResponse[] }
  );

  public readonly columns: TableColumn<PackagingResponse>[] = [
    { label: 'Nome', field: 'name' },
    {
      label: 'Preço Unitário',
      field: 'unitPrice',
      cell: (row) => this.currencyPipe.transform(row.unitPrice, 'BRL') || ''
    }
  ];

  public readonly actions: TableAction<PackagingResponse>[] = [
    {
      label: 'Editar',
      icon: '✏️',
      callback: (row) => this.openEdit(row)
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      callback: (row) => this.requestDelete(row)
    }
  ];

  // Modal State
  public readonly isModalOpen = signal(false);
  public readonly isEditing = signal(false);
  public readonly currentId = signal<number | null>(null);

  // Delete Dialog State
  public readonly isDeleteDialogOpen = signal(false);
  public readonly itemToDelete = signal<PackagingResponse | null>(null);
  public readonly deleteMessage = signal('Deseja realmente excluir esta embalagem? Esta ação não poderá ser desfeita.');

  // Form fields
  public readonly formName = signal('');
  public readonly formUnitPrice = signal(0);

  public reload(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  public openAdd(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.formName.set('');
    this.formUnitPrice.set(0);
    this.isModalOpen.set(true);
  }

  public openEdit(item: PackagingResponse): void {
    this.isEditing.set(true);
    this.currentId.set(item.id);
    this.formName.set(item.name);
    this.formUnitPrice.set(item.unitPrice);
    this.isModalOpen.set(true);
  }

  public save(): void {
    const request: PackagingRequest = {
      name: this.formName(),
      unitPrice: Number(this.formUnitPrice())
    };

    if (this.isEditing() && this.currentId()) {
      this.packagingService.update(this.currentId()!, request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    } else {
      this.packagingService.create(request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    }
  }

  public requestDelete(item: PackagingResponse): void {
    this.itemToDelete.set(item);
    this.deleteMessage.set(
      `Deseja realmente excluir a embalagem "${item.name}"? Esta ação não poderá ser desfeita.`
    );
    this.isDeleteDialogOpen.set(true);
  }

  public confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.packagingService.delete(item.id).subscribe({
      next: () => {
        this.reload();
        this.isDeleteDialogOpen.set(false);
      },
      error: () => {
        this.isDeleteDialogOpen.set(false);
      }
    });
  }

  public setString(sig: { set: (v: string) => void }, value: string | number | null): void {
    if (value === null) return;
    sig.set(String(value));
  }

  public setNumber(sig: { set: (v: number) => void }, value: string | number | null): void {
    if (value === null) return;
    sig.set(Number(value));
  }
}
