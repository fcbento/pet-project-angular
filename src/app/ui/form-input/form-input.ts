import { Component, input, model, signal } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-input',
  imports: [],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
})
export class FormInput implements FormValueControl<string> {
  protected readonly hasError = signal(false);

  public readonly placeholder = input<string>();
  public readonly label = input<string>();
  public readonly type = input<string>('text');
  public readonly value = model('');

  public readonly touched = model<boolean>(false);
  public readonly disabled = input<boolean>(false);

  public readonly readonly = input<boolean>(false);
  public readonly hidden = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly ValidationError.WithOptionalField[]>([]);
}
