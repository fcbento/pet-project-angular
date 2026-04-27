import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  public readonly isOpen = model<boolean>(false);
  public readonly title = input<string>('');
  
  public readonly closed = output<void>();

  public close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
