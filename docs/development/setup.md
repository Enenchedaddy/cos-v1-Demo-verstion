# Development setup

## Prerequisites

- Node.js 20 or newer
- npm
- access to the intended Supabase project and a publishable key
- Playwright browser binaries if running E2E tests

## Install and run

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open `http://localhost:3000`. Populate only the browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for normal development. `.env.local` is ignored.

For deliberate fixture UI work, set `VITE_COS_ALLOW_DEMO=true`. It is ignored by production builds. Restart Vite after changing environment variables.

## Validation

```powershell
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
```

Workspace E2E tests skip unless `COS_E2E_EMAIL` and `COS_E2E_PASSWORD` identify an approved controlled test account. Set `COS_CAPTURE=1` only when screenshots are required. Never place production credentials in test configuration or fixtures.

## Database workflow

The app can use an existing approved Supabase environment; there is no local Supabase/Docker setup in this repository. Before database work, compare `supabase/migrations` with the target project's migration history and inspect schema, policies, grants, functions, and advisors.

Do not execute root SQL snapshots. New changes are timestamped files under `supabase/migrations`, applied to staging through the team's approved Supabase workflow.

## Guarded legacy seed

Use server-only credentials in the local environment, then set:

```dotenv
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_KEY=server-side-key-with-required-access
COS_EXPECTED_SUPABASE_PROJECT_REF=project-ref
COS_SEED_CONFIRMATION=SEED_COS_DEMO_DATA
```

Run `npm.cmd run seed`. The script refuses a project mismatch or non-empty target table. A mid-run failure is not atomic; inspect state before doing anything else.

## Bootstrap scripts

The two scripts in `scripts/bootstrapInitialStaging*.ts` are staging-only, one-time operations. They require an exact project-reference guard, exact operation-specific confirmation phrase, identity fields, app origin, and a server-held service-role key. They are not routine development commands. Obtain explicit approval and review the script immediately before use.

## Deployment

`npm run build` only builds the SPA. Vercel serves it with SPA rewrites from `vercel.json`. Database migrations and Edge Functions are separate deployments. No CI/CD pipeline is committed.

Production builds fail closed unless `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` contain a valid HTTPS project URL and a browser-safe Supabase publishable or legacy anon key. Secret and service-role keys are rejected and must never be copied into a frontend build or static web root.

For the approved IIS LAN deployment, build on the configured development machine. Copy only the generated `dist` directory and `scripts/deployIis.ps1` to the IIS host while preserving that relative layout; do not copy `.env.local`. Then run the guarded deployment from an elevated PowerShell session:

```powershell
.\scripts\deployIis.ps1
```

The script discovers a unique port-80 site, stages a versioned sibling of its current physical path, preserves the existing root ACL and `web.config`, switches the site, recycles its application pool, and restores the previous path automatically if the local HTTP smoke test fails. Pass `-SiteName 'Exact IIS Site Name'` only when the host has multiple port-80 sites.
