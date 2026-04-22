import { Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-select',
  imports: [],
  templateUrl: './form-select.html',
  styleUrl: './form-select.scss',
})
export class FormSelect implements FormValueControl<string | number | null> {
  public readonly value = model<string | number | null>('');
  public readonly touched = model<boolean>(false);

  public readonly placeholder = input<string>();
  public readonly label = input<string>();
  public readonly options = input<{ label: string; value: string | number }[]>([]);
  public readonly disabled = input<boolean>(false);

  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly ValidationError.WithOptionalField[]>([]);
}
