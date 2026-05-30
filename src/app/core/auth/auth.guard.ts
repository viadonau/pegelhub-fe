import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

export const canActivateAuthenticated = createAuthGuard(async (_route, state, authData: AuthGuardData) => {
  if (authData.authenticated) {
    return true;
  }

  return inject(Router).createUrlTree(['/login'], {
    queryParams: state.url === '/login' ? undefined : { returnUrl: state.url }
  });
});
