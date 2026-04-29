import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';

export type DialogType = 'danger' | 'info' | 'success';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  public readonly isOpen = model(false);
  public readonly title = input<string>('Confirmação');
  public readonly message = input<string>('Você tem certeza que deseja realizar esta ação?');
  public readonly confirmText = input<string>('Confirmar');
  public readonly cancelText = input<string>('Cancelar');
  public readonly type = input<DialogType>('danger');

  public readonly confirm = output<void>();
  public readonly cancel = output<void>();

  public onCancel(): void {
    this.isOpen.set(false);
    this.cancel.emit();
  }

  public onConfirm(): void {
    this.isOpen.set(false);
    this.confirm.emit();
  }
}
