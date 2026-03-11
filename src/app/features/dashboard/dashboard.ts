import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DASHBOARD_ROUTES } from './dashboard.const';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly router = inject(Router);

  public readonly currentRoute = signal('');
  public readonly activeRoute = computed(() => this.currentRoute() || this.currentRoute());

  public collapsed = false;
  public transactionsOpen = false;
  public routers = DASHBOARD_ROUTES;

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }

  public toggleTransactions(): void {
    this.transactionsOpen = !this.transactionsOpen;
  }

  public navigate(path: string): void {
    this.currentRoute.set(path);
    this.router.navigate([`/dashboard/${path}`]);
  }
}
