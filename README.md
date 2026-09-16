# DM Kit

A canvas app for laying out and editing "cards" — freeform notes, images,
and stat blocks arranged on a pannable/zoomable board, organized into tabs.
Built with React and Redux; projects are optionally saved to Firebase.

## Requirements

- Node `^22.12.0 || ^24.0.0 || >=26.0.0`

## Setup

```bash
npm install
npm start
```

The app runs fully offline against a local sample project by default — no
account or configuration needed. To enable saving/sign-in, create a
`.env.local` file with your own Firebase project's config:

```
VITE_APP_API_KEY="..."
VITE_APP_AUTH_DOMAIN="..."
VITE_APP_DATABASE_URL="..."
VITE_APP_PROJECT_ID="..."
VITE_APP_STORAGE_BUCKET="..."
VITE_APP_MESSAGE_SENDER_ID="..."
VITE_APP_APP_ID="..."
```

Without these (or without `apiKey`/`authDomain`/`projectId` specifically),
the app stays in offline mode and any action that needs Firebase reports an
in-app error instead of crashing.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server (Vite) |
| `npm run build` | Production build, output to `build/` |
| `npm run serve` | Preview a production build locally |
| `npm test` | Run the unit/integration test suite (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e:install` | One-time Chromium install for e2e tests |
| `npm run test:e2e` | Run the end-to-end test suite (Playwright) |

There is currently no lint configuration.

## Deployment

Every pull request runs the test suite and a production build, then deploys
a preview channel automatically. Deploying to production is a manual step
run from a maintainer's machine via the Firebase CLI.
