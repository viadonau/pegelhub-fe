import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

import { AuthStateService } from './auth-state.service';

export const canActivateAuthenticated = createAuthGuard(async (_route, state, authData: AuthGuardData) => {
  if (authData.authenticated) {
    return true;
  }

  await inject(AuthStateService).login(state.url);
  return false;
});
