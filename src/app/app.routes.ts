import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    data: {
      isLogin: true,
    },
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    data: {
      isLogin: false,
    },
  },
  { path: '**', redirectTo: 'login' },
];
