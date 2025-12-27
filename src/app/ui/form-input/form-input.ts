import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-input',
  imports: [],
  templateUrl: './form-input.html',
  styleUrl: './form-input.scss',
})
export class FormInput {
  public readonly placeholder = input<string>();
  public readonly label = input<string>();
  public readonly disabled = input<boolean>();
  public readonly type = input<string>('text');
  public readonly width = input<string>('400');
}
