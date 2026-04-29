import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { combineLatest, switchMap } from 'rxjs';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { Modal } from '../../../ui/modal/modal';
import { Table } from '../../../ui/table/table';
import { ConfirmDialog } from '../../../ui/confirm-dialog/confirm-dialog';
import { TableAction, TableColumn } from '../../../ui/table/table.model';
import { PurchaseRequest, PurchaseResponse, PurchaseService } from '../purchase.service';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, Table, Button, FormInput, FormSelect, Modal, FormsModule, ConfirmDialog],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class PurchaseList {
  private readonly purchaseService = inject(PurchaseService);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  public readonly startDate = signal(this.getFormattedDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  public readonly endDate = signal(this.getFormattedDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)));
  private readonly refreshTrigger = signal(0);

  public readonly purchases = toSignal(
    combineLatest([
      toObservable(this.startDate),
      toObservable(this.endDate),
      toObservable(this.refreshTrigger)
    ]).pipe(
      switchMap(([start, end]) => this.purchaseService.findAll(start, end))
    ),
    { initialValue: [] as PurchaseResponse[] }
  );

  public readonly columns: TableColumn<PurchaseResponse>[] = [
    { 
      label: 'Data', 
      field: 'purchaseDate', 
      cell: (row) => this.datePipe.transform(row.purchaseDate, 'dd/MM/yyyy HH:mm') || '' 
    },
    { label: 'Tipo', field: 'type' },
    { label: 'Fornecedor', field: 'supplier' },
    { label: 'Produto', field: 'productName' },
    { label: 'Qtd', field: 'quantity' },
    { 
      label: 'Total', 
      field: 'totalPrice', 
      cell: (row) => this.currencyPipe.transform(row.totalPrice, 'BRL') || '' 
    }
  ];

  public readonly actions: TableAction<PurchaseResponse>[] = [
    {
      label: 'Editar',
      icon: '✏️',
      callback: (row) => this.openEdit(row)
    },
    {
      label: 'Excluir',
      icon: '🗑️',
      callback: (row) => this.delete(row.id)
    }
  ];

  public readonly isModalOpen = signal(false);
  public readonly isEditing = signal(false);
  public readonly currentId = signal<number | null>(null);

  // Dialog State
  public readonly isDeleteDialogOpen = signal(false);
  public readonly purchaseIdToDelete = signal<number | null>(null);

  // Form fields
  public readonly formDate = signal(new Date().toLocaleString('sv-SE').substring(0, 16).replace(' ', 'T'));
  public readonly formSupplier = signal('');
  public readonly formProduct = signal('');
  public readonly formQuantity = signal(1);
  public readonly formPrice = signal(0);
  public readonly formType = signal('INSUMOS');

  public readonly typeOptions = [
    { label: 'Insumos', value: 'INSUMOS' },
    { label: 'Marketing', value: 'MARKETING' },
    { label: 'Reposição', value: 'REPOSICAO' },
    { label: 'Outros', value: 'OUTROS' }
  ];

  public reload(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  public openAdd(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.formDate.set(new Date().toLocaleString('sv-SE').substring(0, 16).replace(' ', 'T'));
    this.formSupplier.set('');
    this.formProduct.set('');
    this.formQuantity.set(1);
    this.formPrice.set(0);
    this.formType.set('INSUMOS');
    this.isModalOpen.set(true);
  }

  public openEdit(purchase: PurchaseResponse): void {
    this.isEditing.set(true);
    this.currentId.set(purchase.id);
    this.formDate.set(purchase.purchaseDate.substring(0, 16));
    this.formSupplier.set(purchase.supplier);
    this.formProduct.set(purchase.productName);
    this.formQuantity.set(purchase.quantity);
    this.formPrice.set(purchase.totalPrice);
    this.formType.set(purchase.type || 'INSUMOS');
    this.isModalOpen.set(true);
  }

  public save(): void {
    const request: PurchaseRequest = {
      purchaseDate: new Date(this.formDate()).toISOString(),
      supplier: this.formSupplier(),
      productName: this.formProduct(),
      quantity: Number(this.formQuantity()),
      totalPrice: Number(this.formPrice()),
      type: this.formType()
    };

    if (this.isEditing() && this.currentId()) {
      this.purchaseService.update(this.currentId()!, request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    } else {
      this.purchaseService.create(request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    }
  }

  public delete(id: number): void {
    this.purchaseIdToDelete.set(id);
    this.isDeleteDialogOpen.set(true);
  }

  public confirmDelete(): void {
    const id = this.purchaseIdToDelete();
    if (!id) return;

    this.purchaseService.delete(id).subscribe(() => {
      this.reload();
      this.isDeleteDialogOpen.set(false);
    });
  }

  public setString(signal: { set: (v: string) => void }, value: string | number | null): void {
    if (value === null) return;
    signal.set(String(value));
  }

  public setNumber(signal: { set: (v: number) => void }, value: string | number | null): void {
    if (value === null) return;
    signal.set(Number(value));
  }

  public String(val: any): string {
    return String(val);
  }

  private getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
