import { Component, signal } from '@angular/core';
import { Button } from '../../ui/button/button';
import { ProductList } from './list/list';
import { ProductRegister } from './register/register';


@Component({
  selector: 'app-product',
  imports: [ProductList, Button, ProductRegister],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product {
  public readonly formOpen = signal(false);
  public readonly updateTable = signal(false);

  public openForm(): void {
    this.formOpen.set(this.formOpen() ? false : true);
  }

  public onSuccess(): void {
    this.updateTable.set(this.updateTable() ? false : true);
  }
}
