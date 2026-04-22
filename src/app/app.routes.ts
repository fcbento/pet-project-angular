import { Routes } from '@angular/router';
import { UserService } from './utility/services/user';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/auth/auth').then((m) => m.Auth),
    data: {
      isLogin: true,
    },
  },
  {
    path: 'register',
    loadComponent: () => import('./core/auth/auth').then((m) => m.Auth),
    data: {
      isLogin: false,
    },
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    providers: [UserService],
    children: [
      {
        path: 'categoria',
        loadComponent: () => import('./features/category/category').then((m) => m.Category),
      },
      {
        path: 'produto',
        loadComponent: () => import('./features/product/product').then((m) => m.Product),
      },
      {
        path: 'venda',
        loadChildren: () => import('./features/sale/sale.const').then((m) => m.SALE_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
