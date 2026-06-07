import { Routes } from '@angular/router';

import { canActivateAuthenticated } from './core/auth/auth.guard';
import { OverviewComponent } from './features/overview/overview.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'overview'
  },
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [canActivateAuthenticated],
    title: 'Stations · PegelHub'
  },
  {
    path: 'overview/:stationNumber',
    canActivate: [canActivateAuthenticated],
    title: 'Station · PegelHub',
    loadComponent: () =>
      import('./features/supplier-detail/supplier-detail.component').then((module) => module.SupplierDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
