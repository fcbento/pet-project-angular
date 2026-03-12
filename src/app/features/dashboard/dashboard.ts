import { AfterViewInit, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserService } from '../../utility/services/user';
import { UserStore } from '../../utility/store/user/user.actions';
import { DASHBOARD_ROUTES } from './dashboard.const';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly store = inject(Store);

  public readonly currentRoute = signal('');
  public readonly activeRoute = computed(() => this.currentRoute() || this.currentRoute());

  public readonly userResource = rxResource({
    stream: () => this.userService.getUser(),
  });

  public collapsed = false;
  public routers = DASHBOARD_ROUTES;

  public constructor() {
    effect(() => this.store.dispatch(new UserStore(this.userResource.value()!)));
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }

  public navigate(path: string): void {
    this.currentRoute.set(path);
    this.router.navigate([`/dashboard/${path}`]);
  }

  public ngAfterViewInit(): void {
    this.store.dispatch(new UserStore(this.userResource.value()!));
  }
}
