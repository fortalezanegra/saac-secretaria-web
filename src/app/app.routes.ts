import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./public/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
    children: [
      // Adicione aqui as rotas filhas do dashboard.
      // Exemplo:
      // {
      //   path: 'reunioes-ministeriais',
      //   loadComponent: () =>
      //     import('./reuniao-ministerial/reuniao-ministerial')
      //       .then(m => m.ReuniaoMinisterial)
      // }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
