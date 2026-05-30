import { Routes } from '@angular/router';

import { canActivateAuthenticated } from './core/auth/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { OverviewComponent } from './features/overview/overview.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview'
  },
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [canActivateAuthenticated]
  },
  {
    path: 'overview/:stationNumber',
    canActivate: [canActivateAuthenticated],
    loadComponent: () =>
      import('./features/supplier-detail/supplier-detail.component').then((module) => module.SupplierDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
