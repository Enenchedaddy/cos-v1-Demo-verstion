# Database architecture

## Technology and source of truth

COS uses Supabase PostgreSQL 17. `supabase/migrations` is the authoritative schema history. The migration directory has been reconciled to the connected project's applied history through `20260903083257_ceo_ready_for_invitation`.

The root SQL files are historical snapshots and must not receive new changes:

- `supabase_schema.sql`: legacy demonstration schema;
- `supabase_rls.sql`: an obsolete policy draft;
- `supabase_content_social.sql`: pre-migration Content & Social snapshot.

## Schema ownership

| Domain | PostgreSQL objects |
| --- | --- |
| Legacy operations | `companies`, `products`, `deals`, `quotes`, `orders`, `invoices`, `cylinder_balances`, `support_tickets`, `campaigns`, `approvals`, `audit_logs` |
| Global authorization | `profiles`, `roles`, `permissions`, `role_permissions`, `profile_permissions`, authorization RPCs |
| Provisioning | `user_provisioning_requests`, `user_provisioning_audit_logs`, bootstrap RPCs |
| Content & Social scope | `cs_workspaces`, `cs_clients`, `cs_brands`, `cs_memberships`, staging grants |
| Content & Social workflow | `cs_ideas`, `cs_briefs`, `cs_content_items`, `cs_platform_variants`, `cs_content_versions`, `cs_approval_requests`, `cs_schedules`, `cs_publish_records`, `cs_assets`, `cs_community_records`, `cs_listening_signals`, `cs_metric_observations`, `cs_notifications`, `cs_audit_events` |

Content & Social rows are scoped by workspace/client/brand. Global RBAC and Content & Social memberships are intentionally separate.

## Naming

PostgreSQL identifiers use snake_case. Application models use camelCase. `src/app/portalDataCodec.ts` maps legacy table records; the Content & Social repository owns its equivalent mapping.

## Migration workflow

- Inspect the live schema and migration history first.
- Add a UTC timestamped, snake_case SQL file.
- Make migrations deterministic and additive where possible.
- Never rewrite an applied migration.
- Do not make destructive changes or change global roles, permission assignments, or RLS without explicit approval.
- Apply to staging, verify representative roles, then run Supabase security and performance advisors.
- Commit migration and matching application changes together.

## Seed behavior

`npm run seed` inserts legacy fixtures only after it verifies:

- server-side URL and key are present;
- the URL's project reference matches `COS_EXPECTED_SUPABASE_PROJECT_REF`;
- `COS_SEED_CONFIRMATION=SEED_COS_DEMO_DATA`;
- every target table is empty.

The Data API cannot make the multi-table seed atomic. If a partial failure occurs, stop and inspect the database; do not retry blindly. The lack of a primary key on `cylinder_balances` is an approval-gated schema defect.

## Current live-state caveat

As audited on 2026-09-09, legacy tables are empty and RLS-enabled without policies. That produces deny-by-default browser behavior, but these tables should not be treated as production-ready until ownership and policy design are approved. See the [audit](../audit/2026-09-09-codebase-audit.md).

