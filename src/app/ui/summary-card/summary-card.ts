import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, PercentPipe],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
})
export class SummaryCard {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly type = input<'default' | 'currency' | 'number' | 'percentage'>('default');
  public readonly variant = input<'default' | 'success' | 'warning' | 'danger'>('default');
  public readonly icon = input<string>();
  public readonly details = input<readonly { label: string; value: string | number; type: 'currency' | 'percentage' | 'number' }[]>([]);
}
