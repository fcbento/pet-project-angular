import { Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-select',
  imports: [],
  templateUrl: './form-select.html',
  styleUrl: './form-select.scss',
})
export class FormSelect implements FormValueControl<any> {
  public readonly value = model<any>('');
  public readonly touched = model<boolean>(false);

  public readonly placeholder = input<string>();
  public readonly label = input<string>();
  public readonly options = input<{ label: string; value: any }[]>([]);
  public readonly disabled = input<boolean>(false);

  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly ValidationError.WithOptionalField[]>([]);
}
