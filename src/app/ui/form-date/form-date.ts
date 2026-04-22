import { Component, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-date',
  imports: [],
  templateUrl: './form-date.html',
  styleUrl: './form-date.scss',
})
export class FormDate implements FormValueControl<string> {
  public readonly value = model('');
  public readonly touched = model<boolean>(false);

  public readonly placeholder = input<string>();
  public readonly label = input<string>();
  public readonly disabled = input<boolean>(false);

  public readonly readonly = input<boolean>(false);
  public readonly hidden = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly ValidationError.WithOptionalField[]>([]);
}
