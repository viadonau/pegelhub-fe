import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  includeBearerTokenInterceptor,
  provideKeycloak
} from 'keycloak-angular';

import { routes } from './app.routes';
import { RUNTIME_CONFIG, RuntimeConfig } from './core/config/runtime-config';

export function createAppConfig(runtimeConfig: RuntimeConfig): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZonelessChangeDetection(),
      provideRouter(routes, withComponentInputBinding()),
      provideHttpClient(withFetch(), withInterceptors([includeBearerTokenInterceptor])),
      providePrimeNG({
        theme: {
          preset: Aura,
          options: {
            darkModeSelector: '.ph-dark'
          }
        },
        ripple: true
      }),
      {
        provide: RUNTIME_CONFIG,
        useValue: runtimeConfig
      },
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [
          createInterceptorCondition<IncludeBearerTokenCondition>({
            urlPattern: coreApiUrlPattern(runtimeConfig.apiBaseUrl),
            bearerPrefix: 'Bearer'
          })
        ]
      },
      provideKeycloak({
        config: {
          url: runtimeConfig.keycloak.url,
          realm: runtimeConfig.keycloak.realm,
          clientId: runtimeConfig.keycloak.clientId
        },
        initOptions: {
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
        }
      })
    ]
  };
}

function coreApiUrlPattern(apiBaseUrl: string): RegExp {
  const normalized = apiBaseUrl.replace(/\/$/, '');

  if (/^https?:\/\//i.test(normalized)) {
    return new RegExp(`^${escapeRegExp(normalized)}(?:/.*)?$`, 'i');
  }

  return new RegExp(`^${escapeRegExp(normalized.startsWith('/') ? normalized : `/${normalized}`)}(?:/.*)?$`, 'i');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
