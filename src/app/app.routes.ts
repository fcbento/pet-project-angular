import { Routes } from '@angular/router';

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
  },
  { path: '**', redirectTo: 'login' },
];
