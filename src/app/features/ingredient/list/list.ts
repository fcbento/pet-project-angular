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
import { IngredientRequest, IngredientResponse } from '../ingredient.models';
import { IngredientService } from '../ingredient.service';

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [CommonModule, Table, Button, FormInput, Modal, ConfirmDialog],
  providers: [CurrencyPipe],
  templateUrl: './list.html',
  styleUrl: './list.scss'
})
export class IngredientList {
  private readonly ingredientService = inject(IngredientService);
  private readonly currencyPipe = inject(CurrencyPipe);

  private readonly refreshTrigger = signal(0);

  public readonly ingredients = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.ingredientService.findAll())
    ),
    { initialValue: [] as IngredientResponse[] }
  );

  public readonly columns: TableColumn<IngredientResponse>[] = [
    { label: 'Nome', field: 'name' },
    { label: 'Unidade', field: 'unit' },
    {
      label: 'Preço Unitário',
      field: 'unitPrice',
      cell: (row) => this.currencyPipe.transform(row.unitPrice, 'BRL') || ''
    }
  ];

  public readonly actions: TableAction<IngredientResponse>[] = [
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
  public readonly ingredientToDelete = signal<IngredientResponse | null>(null);
  public readonly deleteMessage = signal('Deseja realmente excluir este ingrediente? Esta ação não poderá ser desfeita.');

  // Form fields
  public readonly formName = signal('');
  public readonly formUnit = signal('');
  public readonly formUnitPrice = signal(0);

  public reload(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  public openAdd(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.formName.set('');
    this.formUnit.set('');
    this.formUnitPrice.set(0);
    this.isModalOpen.set(true);
  }

  public openEdit(ingredient: IngredientResponse): void {
    this.isEditing.set(true);
    this.currentId.set(ingredient.id);
    this.formName.set(ingredient.name);
    this.formUnit.set(ingredient.unit || '');
    this.formUnitPrice.set(ingredient.unitPrice);
    this.isModalOpen.set(true);
  }

  public save(): void {
    const request: IngredientRequest = {
      name: this.formName(),
      unit: this.formUnit(),
      unitPrice: Number(this.formUnitPrice())
    };

    if (this.isEditing() && this.currentId()) {
      this.ingredientService.update(this.currentId()!, request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    } else {
      this.ingredientService.create(request).subscribe(() => {
        this.isModalOpen.set(false);
        this.reload();
      });
    }
  }

  public requestDelete(ingredient: IngredientResponse): void {
    this.ingredientToDelete.set(ingredient);

    this.ingredientService.checkUsage(ingredient.id).subscribe({
      next: (result) => {
        if (result.inUse) {
          this.deleteMessage.set(
            `O ingrediente "${ingredient.name}" está vinculado a uma ou mais fichas técnicas. Remova o vínculo antes de excluir.`
          );
        } else {
          this.deleteMessage.set(
            `Deseja realmente excluir o ingrediente "${ingredient.name}"? Esta ação não poderá ser desfeita.`
          );
        }
        this.isDeleteDialogOpen.set(true);
      },
      error: () => {
        this.deleteMessage.set('Deseja realmente excluir este ingrediente? Esta ação não poderá ser desfeita.');
        this.isDeleteDialogOpen.set(true);
      }
    });
  }

  public confirmDelete(): void {
    const ingredient = this.ingredientToDelete();
    if (!ingredient) return;

    this.ingredientService.delete(ingredient.id).subscribe({
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

  public String(val: any): string {
    return String(val);
  }
}
