# COS architecture guide

## System boundary

COS is a Vite + React + TypeScript single-page application. There is no active Express server or controller layer. Supabase is the persistence and authentication boundary; privileged identity operations are implemented as Supabase Edge Functions. Typed fixtures may run only in an explicitly enabled development build and are never a production fallback.

```
main.tsx
  -> App.tsx (application shell and workspace selection)
    -> App.tsx / app/usePortalData.ts (legacy portal data state and Supabase sync)
      -> supabaseClient.ts (environment-backed Supabase client)
    -> components/ (shared UI and workspace presentation)
    -> content-social/ (self-contained Content & Social feature)
    -> navigation/ (shared sidebar contract and platform navigation configuration)
```

## Directory map

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Shell-level loading state, workspace transition, approval-link entry, and audit stream UI. |
| `src/app/` | Application-level state orchestration. `usePortalData` is the only owner of demo persistence/synchronisation for the core portal entities. |
| `src/components/` | Reusable presentational components and the Management, Sales & Marketing, Gateway, and Design System workspace views. |
| `src/content-social/` | Content & Social domain types, validation/business rules, repository, state hook, UI, approval portal, and tests. |
| `src/navigation/` | Navigation data contracts plus Management and Sales & Marketing sidebar definitions. |
| `src/data.ts` / `src/types.ts` | Typed demo seed records and shared portal entity contracts. |
| `src/supabaseClient.ts` | Browser-safe Supabase client configuration. |
| `supabase/functions/admin-user-provisioning/` | JWT-protected, server-side invitation and user-profile administration. |
| `supabase/migrations/` | Ordered and reviewable Supabase schema migrations. |
| `scripts/seedSupabase.ts` | Optional Supabase seed runner; it is the only script that needs server-side Supabase credentials. |
| `supabase_*.sql` | Schema, RLS, and Content & Social database definitions. |
| `e2e/` / `src/**/*.test.*` | Playwright browser coverage and Vitest unit/component coverage. |

## Data flow

1. The legacy portal initializes with empty collections unless an explicit development-only fixture flag is enabled.
2. If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, it loads collections from Supabase.
3. Workspace components receive data and typed update callbacks through props.
4. An update currently changes local state before writing the collection. Failed writes must be surfaced as explicit error states; they must never activate fixture data in production.
5. Content & Social is deliberately feature-scoped: its repository and `useContentSocial` own its data/workflow boundary instead of adding another portal-wide data mechanism.

## Authentication and authorization

`AuthorizationProvider` owns the browser authorization state. It restores the Supabase session, calls the caller-bound `public.get_my_authorization()` RPC, validates the returned profile/role/permission snapshot, and fails closed on errors. The snapshot combines active role and individual profile permissions. `ProtectedRoute` gates canonical workspace URLs by permission. See [AUTHORIZATION.md](AUTHORIZATION.md) for the role matrix, route rules, dual-approval provisioning model, legacy URL normalization, and Content & Social boundary.

## Navigation flow

`navigation/types.ts` contains the neutral sidebar contract. Platform configuration lives in `navigation/management.ts` and `navigation/salesMarketing.ts`; `components/DualRailNavigation.tsx` renders that data. This preserves platform-specific routes and permissions while keeping the visual/navigation behaviour shared.

## Environment variables

Browser-visible values must use the `VITE_` prefix:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Browser | Public Supabase anon key. |
| `SUPABASE_URL` | Seed script | Supabase URL for development seeding. |
| `SUPABASE_KEY` | Seed script only | Service role key. Never expose it through `VITE_` or commit it. |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function secret only | Privileged Auth Admin and provisioning access. Never expose or commit. |
| `COS_APP_ORIGIN` | Edge Function secret/configuration | Exact staging application origin allowed to invoke provisioning and receive invite redirects. |

## Working on the codebase

- Add a portal-wide persisted entity in `src/types.ts`, seed it in `src/data.ts`, and extend `usePortalData.ts` with its table mapping/read/write boundary.
- Add a sidebar area by changing only the relevant file in `src/navigation/`; do not hard-code additional route checks in the sidebar renderer.
- Add Content & Social behaviour inside `src/content-social/`, keeping validation in `model.ts`, workflow rules in `domain.ts`, and storage in `repository.ts`.
- Keep workspace components focused on UI composition and local interaction state. Do not add direct Supabase calls to them.
- Add a Vitest test for domain or component logic and a Playwright test when a user-facing workflow crosses workspaces.

## Engineering constraints

- No active server/API controller layer exists in this repository. Add a server only when a requirement cannot be met safely with Supabase/RPC/Edge Functions.
- Do not use a production demo fallback when changing persistence code. Use explicit loading, empty, restricted, unavailable, and error states instead.
- Use parameterised Supabase client methods, scoped data, and the provided RLS scripts; never store service-role credentials in client code.
