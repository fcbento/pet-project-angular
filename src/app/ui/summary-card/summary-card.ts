import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
})
export class SummaryCard {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly type = input<'default' | 'currency' | 'number'>('default');
  public readonly variant = input<'default' | 'success' | 'warning' | 'danger'>('default');
  public readonly icon = input<string>();
}
