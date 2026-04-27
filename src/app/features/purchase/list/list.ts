import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { Button } from '../../../ui/button/button';
import { FormInput } from '../../../ui/form-input/form-input';
import { FormSelect } from '../../../ui/form-select/form-select';
import { Modal } from '../../../ui/modal/modal';
import { Table } from '../../../ui/table/table';
import { TableAction, TableColumn } from '../../../ui/table/table.model';
import { PurchaseRequest, PurchaseResponse, PurchaseService } from '../purchase.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, Table, Button, FormInput, FormSelect, Modal, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class PurchaseList {
  private readonly purchaseService = inject(PurchaseService);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  public readonly startDate = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  public readonly endDate = signal(new Date().toISOString().split('T')[0]);

  public readonly purchases = toSignal(
    toObservable(this.startDate).pipe(
      switchMap(() => this.purchaseService.findAll(this.startDate(), this.endDate()))
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

  // Form fields
  public readonly formDate = signal(new Date().toISOString().substring(0, 16));
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
    this.startDate.set(this.startDate());
  }

  public openAdd(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.formDate.set(new Date().toISOString().substring(0, 16));
    this.formSupplier.set('');
    this.formProduct.set('');
    this.formQuantity.set(1);
    this.formPrice.set(0);
    this.formType.set('INSUMOS');
    this.isModalOpen.set(true);
    console.log(this.isModalOpen())
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
    if (confirm('Deseja realmente excluir esta compra?')) {
      this.purchaseService.delete(id).subscribe(() => this.reload());
    }
  }

  public setString(signal: { set: (v: string) => void }, value: string | number | null): void {
    if (value === null) return;
    signal.set(String(value));
  }

  public setNumber(signal: { set: (v: number) => void }, value: string | number | null): void {
    if (value === null) return;
    signal.set(Number(value));
  }
}
