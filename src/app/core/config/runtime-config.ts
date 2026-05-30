import { InjectionToken } from '@angular/core';

export interface RuntimeConfig {
  apiBaseUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
    apiClientId: string;
  };
}

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('PegelHub runtime config');

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const response = await fetch('/assets/config.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Could not load runtime config: ${response.status} ${response.statusText}`);
  }

  const config = (await response.json()) as RuntimeConfig;

  if (!config.apiBaseUrl || !config.keycloak?.url || !config.keycloak.realm || !config.keycloak.clientId) {
    throw new Error('Runtime config is missing required PegelHub settings.');
  }

  return config;
}
