import { Component, signal } from '@angular/core';
import { Button } from '../../ui/button/button';
import { List } from './list/list';
import { Register } from './register/register';

@Component({
  selector: 'app-category',
  imports: [List, Button, Register],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  public readonly formOpen = signal(false);

  public openForm(): void {
    this.formOpen.set(this.formOpen() ? false : true);
  }
}
