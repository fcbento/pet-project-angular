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
        path: 'produto/ficha-tecnica',
        loadComponent: () => import('./features/product/technical-sheet/register/register').then((m) => m.TechnicalSheetRegister),
      },
      {
        path: 'produto/detalhes/:id',
        loadComponent: () => import('./features/product/technical-sheet/details/details').then((m) => m.TechnicalSheetDetails),
      },
      {
        path: 'venda',
        loadChildren: () => import('./features/sale/sale.const').then((m) => m.SALE_ROUTES),
      },
      {
        path: 'ingredientes',
        loadComponent: () => import('./features/ingredient/list/list').then((m) => m.IngredientList),
      },
      {
        path: 'embalagem',
        loadComponent: () => import('./features/packaging/list/list').then((m) => m.PackagingList),
      },
      {
        path: 'orcamento',
        loadComponent: () => import('./features/budget/budget').then((m) => m.Budget),
      },
      {
        path: 'gestao',
        loadComponent: () => import('./features/gestao/gestao').then((m) => m.Gestao),
      },
      {
        path: 'compras',
        loadComponent: () => import('./features/purchase/list/list').then((m) => m.PurchaseList),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
