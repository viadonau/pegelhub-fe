# PegelHub Frontend Next

Clean Angular 21 V1 frontend for proving the PegelHub auth/API path without carrying over legacy frontend patterns.

## V1 Scope

- load runtime config from `/assets/config.json` before Angular bootstraps
- initialize Keycloak with `check-sso`, PKCE S256, and silent SSO
- protect the shell and overview route
- send bearer tokens only to the configured Core API URL
- fetch `GET /api/v1/supplier` through `httpResource`
- fetch supplier measurements from `GET /api/v1/measurement/supplier/{range}`
- render loading, error, empty, and table states through local `ph-*` UI wrappers
- render a simple supplier detail chart through a decoupled `ph-line-chart` wrapper

## Local Development

Start the backend stack from `pegelhub/core` first. The local Keycloak realm import includes:

- client: `pegelhub-frontend`
- user: `pegel`
- password: `pegel`
- roles: `metadata:read` and `measurement:read` on `pegelhub-core-api`

If a Keycloak volume already exists, the import file is not automatically replayed into the existing realm.

Run the frontend:

```bash
npm install
npm start
```

The dev server runs on `http://127.0.0.1:4200/` and proxies `/api` to `http://localhost:8080`.

Open `http://127.0.0.1:4200/overview`, sign in with the local user, then inspect a supplier row to view measurements for that station.

## Runtime Config

Local default:

```json
{
  "apiBaseUrl": "/api/v1",
  "keycloak": {
    "url": "http://pegelhub-keycloak.test:8082",
    "realm": "pegelhub",
    "clientId": "pegelhub-frontend",
    "apiClientId": "pegelhub-core-api"
  }
}
```

The Docker image writes this file at container startup from environment variables, so the same image can move between environments.

## Commands

```bash
npm run build
npm start
npm run start:no-proxy
```
