import { Routes } from '@angular/router';

import { ErrorPageComponent } from './features/error/error-page.component';
import { AppShellComponent } from './shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        title: 'Messreihen · PegelHub',
        loadComponent: () =>
          import('./features/time-series-overview/time-series-overview.component').then(
            (module) => module.TimeSeriesOverviewComponent,
          ),
      },
      {
        path: 'forbidden',
        component: ErrorPageComponent,
        title: 'Zugriff nicht möglich · PegelHub',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
