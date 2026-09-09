# Legacy operations data

## Responsibility

This boundary supports older demonstration models shared by the Sales & Marketing and Management shells.

## Entities

Companies, products, deals, quotes, orders, invoices, cylinder balances, support tickets, campaigns, approval requests, and audit logs are typed in `src/types.ts` and have fixture records in `src/data.ts`.

`src/app/usePortalData.ts` is the only runtime adapter. It loads collections in parallel, converts PostgreSQL snake_case to application camelCase, reports explicit status, converts writes back to snake_case, checks Supabase errors, and rolls back failed optimistic changes.

## Current limitations

The connected database contains no legacy rows. RLS is enabled but no policies are installed, so browser access is deny-by-default. `cylinder_balances` has no primary key. The existing model mixes CRM, fulfilment, finance, service, marketing, approvals, and audit concepts without explicit ownership.

Treat this as a compatibility boundary, not the template for new domains. New working modules should own their schemas, domain logic, persistence, permissions, and tests together.

