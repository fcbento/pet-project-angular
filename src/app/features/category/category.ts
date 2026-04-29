import { Component, signal } from '@angular/core';
import { Button } from '../../ui/button/button';
import { List } from './list/list';
import { Register } from './register/register';
import { Modal } from '../../ui/modal/modal';

@Component({
  selector: 'app-category',
  imports: [List, Button, Register, Modal],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  public readonly formOpen = signal(false);
  public readonly updateTable = signal(false);

  public openForm(): void {
    this.formOpen.set(this.formOpen() ? false : true);
  }

  public onSuccess(): void {
    this.updateTable.update(v => !v);
    this.formOpen.set(false);
  }
}
