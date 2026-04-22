import { Routes } from '@angular/router';

export const SALE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sale').then((c) => c.Sale),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./list/list').then((c) => c.SaleList),
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register').then((c) => c.SaleRegister),
      },
    ],
  },
];
