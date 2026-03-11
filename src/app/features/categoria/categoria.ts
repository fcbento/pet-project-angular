import { Component, signal } from '@angular/core';
import { Button } from '../../ui/button/button';
import { List } from './list/list';
import { Register } from './register/register';

@Component({
  selector: 'app-categoria',
  imports: [List, Button, Register],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria {
  public readonly formOpen = signal(false);

  public openForm(): void {
    this.formOpen.set(this.formOpen() ? false : true);
  }
}
