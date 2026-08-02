# PegelHub Frontend

Angular 21 frontend for the PegelHub monitoring workflow.

## Current Scope

- load runtime configuration before Angular bootstrap;
- authenticate with Keycloak using `login-required` and PKCE S256;
- attach bearer tokens only to the configured Core API;
- list time series with measuring-point and station context in AG Grid;
- show the latest value, metadata, and bucketed measurement history for one time series;
- optionally display RNW and HSW chart references for water-level series;
- support system-aware light and dark themes without a reload flash.

The frontend reads stations, station owners, measuring points, time series, raw latest measurements, and chart buckets from `/api/v1`. Metadata administration is intentionally outside this branch.

## Local Development

Start the backend stack from `pegelhub/core`, then run:

```bash
npm install
npm start
```

The development server runs at [http://localhost:4200/overview](http://localhost:4200/overview) and proxies `/api` to `http://localhost:8080`.

To target another local Core instance:

```bash
PEGELHUB_API_PROXY_TARGET=http://localhost:8090 npm start
```

Keycloak validates browser origins exactly. The imported local realm defaults to `http://localhost:4200`; a different host or port must also be configured on the `pegelhub-frontend` client.

## Runtime Configuration

The frontend reads `/assets/config.json`:

```json
{
  "apiBaseUrl": "/api/v1",
  "keycloak": {
    "url": "http://pegelhub-keycloak.test:8082",
    "realm": "pegelhub",
    "clientId": "pegelhub-frontend"
  }
}
```

The Docker entrypoint writes the same shape from `PH_API_BASE_URL`, `PH_KEYCLOAK_URL`, `PH_KEYCLOAK_REALM`, and `PH_KEYCLOAK_CLIENT_ID`.

## Commands

```bash
npm start
npm run format
npm run format:check
npm run typecheck
npm test -- --watch=false
npm run build
npm run check
npm run smoke:live
```

`npm run check` runs formatting, TypeScript checks, and tests. Run `npm run build` separately for the production bundle. `npm run smoke:live` expects the backend stack and frontend dev server to be running and verifies the configured Keycloak and Core API path through the frontend proxy.

See [PRODUCT.md](PRODUCT.md) for current product, design, and frontend architecture decisions.
