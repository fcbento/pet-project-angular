import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public collapsed = false;
  public transactionsOpen = false;

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }

  public toggleTransactions(): void {
    this.transactionsOpen = !this.transactionsOpen;
  }
}
