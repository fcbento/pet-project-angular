import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { SaleResponse } from '../sale.models';
import { Modal } from '../../../ui/modal/modal';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class SaleDetail {
  public readonly sale = input.required<SaleResponse | null>();
  public readonly isOpen = input.required<boolean>();
  public readonly close = output<void>();

  public onOpenChange(open: boolean): void {
    if (!open) {
      this.close.emit();
    }
  }
}
