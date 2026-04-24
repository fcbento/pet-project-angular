import { Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-switch',
  imports: [],
  templateUrl: './form-switch.html',
  styleUrl: './form-switch.scss',
})
export class FormSwitch implements FormValueControl<boolean> {
  public readonly value = model<boolean>(false);
  public readonly touched = model<boolean>(false);

  public readonly label = input<string>();
  public readonly disabled = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly ValidationError.WithOptionalField[]>([]);

  public toggle(): void {
    if (this.disabled()) return;
    this.value.set(!this.value());
    this.touched.set(true);
  }
}
