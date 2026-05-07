import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  public readonly text = input<string>('');
  public readonly type = input<'primary' | 'success' | 'warning' | 'danger' | 'info'>('info');
}
