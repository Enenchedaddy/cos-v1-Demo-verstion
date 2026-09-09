# Sales and Marketing

## Responsibility

The current workspace provides permission-filtered navigation, cross-record search, dashboard summaries, record inspection, a deal-creation interaction, and the host surface for Content & Social.

## Ownership

- Frontend: `SalesMarketingPlatform.tsx`, `SalesMarketingSidebar.tsx`, `navigation/salesMarketing.ts`
- Data boundary: `app/usePortalData.ts`
- Database currently read: `companies`, `deals`, `campaigns`, `approvals`, `audit_logs`
- Related permissions: `sales.*`, `marketing.*`, and the staging-only `testing.sales_marketing_interface.view`

## Implemented behavior

Global permissions determine visible areas and whether a user may create sales records. Search indexes companies, deals, campaigns, local task/lead state, and audit entries. A new deal updates the legacy deal collection. Tasks and leads are local component state and are not durable.

`testing.sales_marketing_interface.view` exposes navigation for staging/build inspection only. It grants no sales/marketing mutations, database access, provisioning authority, or Content & Social data.

## Partial/navigation-only areas

CRM, sales execution, commerce, campaigns, paid media, lifecycle, creators/partnerships, analytics, approvals, and settings do not yet have independent end-to-end modules. Most use shared shell records and local state. Future implementation should add one feature boundary at a time with explicit data ownership, permission checks, RLS, and tests.

## Dependencies

The workspace depends on global authorization for visibility, the legacy data adapter for shared records, and scoped Content & Social membership for that embedded feature.

