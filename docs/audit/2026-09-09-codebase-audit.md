# COS full codebase audit — 2026-09-09

## Executive summary

COS is a single React/Vite application using Supabase Auth, PostgreSQL/Data API/RPC, and one privileged Edge Function. It is not a full-stack monorepo and does not have a conventional API server. The codebase contains a strong, isolated Content & Social domain and a governed provisioning design, alongside large presentation shells and an older shared business-data model that is not production-ready.

This pass kept the current deployment shape, separated routing and legacy persistence from the application shell, fixed silent database error handling and public approval routing, removed traced dead code, restored missing local migration history, and created canonical documentation. It did not modify the live database, roles, permission assignments, or RLS policies.

## Audit scope and evidence

Reviewed source, package/config files, ignored environment-variable names, tests, scripts, Vercel configuration, SQL snapshots, every local migration, Edge Function code, relevant Git history/status, and the connected Supabase project's tables, columns, keys, row counts, functions, grants, RLS expressions, migration records, deployed function metadata, and security/performance advisors.

The repository started clean on `main` at `5a10c34`. The existing commit and all unrelated history were preserved. Secret values were never printed or copied.

## Product mental model

Primary users are employees assigned one global role, independently scoped Content & Social contributors/approvers, technical provisioning operators with individual grants, and external client approvers holding one-time links.

Actual domains are:

- identity, global RBAC, and invitation-based user lifecycle;
- Sales & Marketing navigation, search, summaries, and limited local/demonstration interactions;
- Content & Social planning-to-publishing workflow with its own membership model;
- Management executive presentation and search shell;
- legacy cross-functional records for CRM/order/finance/service/marketing demonstrations;
- a permission-gated design-system reference.

There is no implemented email service beyond Supabase Auth invitations, no queue/cron/background worker, no billing module, and no external integration layer.

## Initial structure

```text
main.tsx
  hand-written route switch
  AuthorizationProvider
App.tsx (~879 lines)
  workspace orchestration
  11 collection states
  direct Data API reads/writes
  approval query routing
  two large unreachable gateway implementations
components/
  large workspace and design-system components
content-social/
  cohesive feature boundary
supabase/
  Edge Function
  incomplete local migration history
root *.sql and fragmented Markdown
```

## Resulting structure

```text
src/
  app/
    AppRouter.tsx
    portalDataCodec.ts
    usePortalData.ts
    focused tests
  auth/
  components/
  content-social/
  navigation/
supabase/
  functions/admin-user-provisioning/
  migrations/              reconciled applied history
scripts/
e2e/
docs/
  architecture/
  modules/
  api/
  security/
  development/
  audit/
```

## Key findings

### P0 — production blockers / approval required

1. **Global workspace overgrant drift.** The live `get_my_authorization()` function maps every `SOFTWARE_ENGINEER` to Sales & Marketing and Management workspaces. That conflicts with the repository rule that the role receives no general business workspace and that `testing.sales_marketing_interface.view` is interface-only. Fix requires an explicitly approved migration and five-role negative/positive route and RLS tests.
2. **Malformed Content & Social scope policies.** PostgreSQL stored `cs_workspaces_member_select` with a comparison equivalent to membership `workspace_id = id` on the membership alias, and `cs_clients_member_select` with self-comparison/wrong-ID expressions. Valid specific memberships can be denied. Qualify every table/parameter reference in a reviewed migration and test global, client, brand, and no-membership cases.
3. **Legacy business schema has no authorized production path.** Eleven tables are RLS-enabled and empty, with no policies. Deny-by-default is safer than broad access, but the UI cannot be considered live until each domain has ownership, policy, constraint, and mutation rules. Do not install blanket authenticated policies.

### P1 — important

1. Provisioning spans Auth invitation/admin calls and multiple database writes without transactionality or idempotency. Add reconciliation/compensation before high-volume use.
2. Add a primary key to `cylinder_balances` and supporting indexes for eight advised foreign keys through approved migrations.
3. Reduce Auth OTP expiry to one hour or less and enable leaked-password protection in the Supabase Auth settings.
4. Add explicit deployment security headers, especially Content Security Policy and a referrer policy protecting approval-token URLs.
5. Run credentialed staging E2E across all five roles and Content & Social membership scopes. Repository E2E now runs when controlled credentials exist, but credentials were not invented.
6. Establish a CI workflow for type checking, Vitest, build, and non-secret E2E smoke tests. No CI/CD is currently committed.
7. Upgrade Vitest to 4.1.11 or later when the long-running workspace Vite process can be stopped. The current 4.1.10 test-only tree has two moderate `@vitest/mocker` advisories; production dependencies audit clean.

### P2 — maintainability

1. Split `DesignSystemPlatform.tsx` and `ManagementPlatform.tsx` by active route once route sections have real independent behavior.
2. Reformat and split the densely packed `ContentSocialModule.tsx` into route-level views while preserving the feature boundary.
3. Break `index.css` into design tokens, global foundations, shared components, and feature styles without changing cascade order.
4. Replace the legacy multi-domain data model with feature-owned adapters as real modules are implemented.
5. Quarantine or eventually remove root SQL snapshots after confirming no operator workflow depends on them.
6. Review direct dependency duplication/candidates: Vite appears in both dependency groups; direct `autoprefixer` and `esbuild` usage was not found. Change the lockfile only in a dedicated dependency update.

### P3 — future product architecture

1. Promote navigation-only CRM, lifecycle, paid-media, analytics, strategy, organisation, and acquisition areas only when real rules/data are approved.
2. Add observability around correlation IDs, provisioning reconciliation, and public approval failures.
3. Consider a conventional API/service only when integrations, transactional workflows, or independently deployed workers create a concrete need.

## Structural and code-quality findings

- `App.tsx` duplicated `usePortalData`, cast snake_case database rows directly to camelCase types, and failed to inspect Supabase `error` results on writes. This was consolidated and corrected.
- PostgreSQL legacy columns are snake_case while fixtures/models are camelCase. A recursive codec now owns this boundary and has focused tests.
- Public approval routing occurred after employee route protection, so anonymous client links reached login instead of their token portal. Routing now happens at the application router.
- Content & Social enabled fixtures for every development build even without the explicit flag, and returned fixtures when Supabase was unconfigured. It now requires both development mode and the flag.
- Management rendered one real sidebar and carried a second hidden legacy sidebar. The hidden implementation and now-unreferenced sidebar component were removed.
- The Edge Function repeated an unreachable user-update branch after request-specific branches. It was removed without changing the reachable contract.
- Obsolete hard-coded mock-user routing was referenced only by its own tests and violated the direction of database-derived authorization. It was removed.
- The seed used browser variables, did not map column names, swallowed per-table failures, and reported completion after errors. It now uses server-only variables, target/confirmation/empty-table guards, mapping, and fail-fast behavior.
- Loading and service failures previously risked retaining or silently showing fixtures. Production now receives explicit statuses and empty collections.

## API review

No REST controller layer exists. Data API calls are now concentrated in feature adapters rather than `App`. The Edge Function validates origin, caller JWT, active authorization, action permissions, separation of duties, and input sizes. It returns correlation IDs and stable error payloads.

Remaining API concerns are the Edge Function's cross-system partial failure and the broad execute grants on security-definer RPC entry points. The Content & Social public RPC is intentionally token-accessible; its internal validation, token entropy/expiry/revocation, and search path must remain part of every review.

## Database review

The live project was healthy on PostgreSQL 17. Legacy tables were empty. Content & Social had one workspace, one client, one brand, three memberships, and no business workflow rows. Global authorization contained five roles and twenty-four permissions.

Eight applied Content & Social migrations existed live but not locally. They were restored byte-for-logical-content from `supabase_migrations.schema_migrations`. The local CEO migration filename used `20260903073000` while the applied record used `20260903083257`; the file now matches the applied version. No migration was applied and no live row/schema/function was changed.

Advisor-reported unused indexes were not removed: the affected tables are empty/new, so usage evidence is insufficient. Root SQL snapshots were not executed.

## Security review

- No actual local environment value appeared in tracked files, and no obvious committed key/JWT pattern was found.
- Service-role access remains limited to server-side scripts and the Edge Function.
- Authorization comes from `get_my_authorization()`, not local/session storage, URLs, emails, or frontend constants.
- React text rendering is used in audited UI paths; no raw-HTML rendering was found.
- Demo data is now explicitly development-only.
- The critical live authorization defects are documented rather than silently changed.

## Architecture plan and execution record

### Current structure

Single SPA, manual route switch, direct Supabase access in a god component, one isolated feature, one Edge Function, incomplete migration checkout, fragmented docs.

### Target structure for this pass

Retain the single deployable SPA; extract app routing and cross-domain adapter; preserve feature-owned Content & Social; retain Supabase as backend; reconcile migrations; make docs canonical; leave policy/role changes approval-gated.

### Files moved

No broad file moves. Moving the large workspace components would create import churn without establishing new ownership.

### Files merged/consolidated

- Direct legacy reads/writes in `App.tsx` consolidated into `app/usePortalData.ts`.
- Route selection in `main.tsx` and approval routing in `App.tsx` consolidated into `app/AppRouter.tsx`.

### Files split/new

Added the router, legacy data codec/tests, hook error tests, Content & Social demo-gate test, public approval E2E, portable clean script, environment template, contribution guide, and structured documentation.

### Files/code deleted

- unreachable gateway variants and hidden audit stream from `App.tsx`;
- hidden Management sidebar markup and unreferenced `SidebarEntityScope.tsx`;
- unreferenced `RoadmapSpecs.tsx`;
- obsolete `mockRoles.ts`, `postLoginRouting.ts`, and their self-contained test;
- duplicate unreachable Edge Function actions.

### Database changes

Repository-history reconciliation only. No live database change. Proposed P0/P1 database changes remain unimplemented pending approval.

### Risks and mitigations

- Large deletion risk was limited to statically unreachable or unreferenced code, verified by reference search and TypeScript.
- Data-adapter behavior changed intentionally; codec and error classification tests cover the new boundary.
- Public routing preserves the legacy token parameter.
- Migration files were copied from applied history rather than reconstructed from assumptions.
- No role/RLS change was made without authority.

## Validation record

- `npm run lint`: passed after the final refactor.
- `npm run test:run`: 15 files passed, 53 tests passed.
- `npm run build`: passed. Workspace lazy loading reduced the main JavaScript chunk from about 917 kB to 493.85 kB and removed Vite's chunk-size warning.
- `npm run test:e2e`: two public client-approval checks passed (desktop/mobile); ten credential-gated employee journeys skipped because no approved E2E account was supplied.
- Development server: Vite started successfully on port 3001 because an existing process owned port 3000. The prescribed `agent-browser` binary was unavailable, so Playwright provided browser verification.
- `npm ci --dry-run --ignore-scripts`: passed, confirming manifest/lockfile consistency.
- `npm audit --omit=dev`: zero vulnerabilities. Full audit: two moderate Vitest-only advisories remain.
- Secret-pattern scan: no tracked Supabase secret/JWT pattern found; the ignored local environment file was not read into documentation or output.
- Migration reconciliation: all nine recovered local files exactly matched their live applied statements after newline normalization.
- Live Supabase advisor recheck: no error-severity items; the documented security and performance findings remain because no live DDL/auth setting was changed.

## Final assessment

The repository is substantially easier to navigate and tells the truth about its architecture and product maturity. The most important remaining work is not another folder reshuffle: it is approved correction and verification of authorization/RLS, followed by feature-by-feature replacement of demonstration shells with owned, secured, tested modules.
