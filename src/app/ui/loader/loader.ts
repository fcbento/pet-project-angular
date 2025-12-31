import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  public readonly size = input<'sm' | 'md' | 'lg'>();
  public readonly color = input<'primary' | 'secondary' | 'white'>();
}
