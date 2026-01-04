import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, linkedSignal } from '@angular/core';
import { Store } from '@ngxs/store';
import { CloseToast } from '../../utility/toast/toast.actions';
import { ToastSelectors } from '../../utility/toast/toast.selectors';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  private readonly store = inject(Store);

  protected readonly toast = inject(Store).selectSignal(ToastSelectors.open);
  protected readonly activeToast = linkedSignal(this.toast);

  protected readonly isActive = computed(
    () => this.activeToast().title !== '' && this.activeToast().message !== '',
  );

  protected readonly toastType = computed(() => ({
    'toast--info': this.activeToast().type === 'info',
    'toast--success': this.activeToast().type === 'success',
    'toast--error': this.activeToast().type === 'error',
    'toast--warning': this.activeToast().type === 'warning',
  }));

  protected readonly icon = computed(() => {
    switch (this.activeToast().type) {
      case 'success':
        return '✔';
      case 'error':
        return '✖';
      case 'warning':
        return '!';
      case 'info':
        return 'ℹ';
    }
  });

  protected readonly duration = computed(() => this.activeToast().duration ?? 5000);

  public constructor() {
    effect(() => {
      this.closeToast();
    });
  }

  private closeToast(): void {
    if (this.isActive()) {
      setTimeout(() => this.store.dispatch(new CloseToast()), this.duration());
    }
  }

  protected manualClose(): void {
    this.store.dispatch(new CloseToast());
  }
}
