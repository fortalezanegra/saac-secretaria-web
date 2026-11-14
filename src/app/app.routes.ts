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
    pathMatch: 'full',
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'secretaria/reunioes-ministeriais/cadastro',
    loadComponent: () =>
      import('./secretaria/reuniao-ministerial/cadastro-reuniao-ministerial/cadastro-reuniao-ministerial')
        .then(m => m.CadastroReuniaoMinisterial),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
