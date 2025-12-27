import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonType } from './button.model';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  protected readonly buttonType = computed(() => ({
    'button--primary': this.type() === 'primary',
    'button--secondary': this.type() === 'secondary',
    'button--tertiary': this.type() === 'tertiary',
    'button--link': this.type() === 'link',
  }));

  public readonly name = input.required<string>();
  public readonly type = input.required<ButtonType>();
  public readonly disabled = input.required<boolean>();
  public readonly clicked = output<void>();
}
