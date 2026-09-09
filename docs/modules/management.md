# Management

## Responsibility

The Management workspace is an executive command and governance presentation shell. It offers the standardized dual-rail navigation, global record search, state simulation, and views for home, performance, governance, strategy, organisation, acquisitions, alerts, and group administration.

## Ownership

- Frontend: `ManagementPlatform.tsx`, `ManagementSidebar.tsx`, `navigation/management.ts`
- Database read models: companies, orders, approvals, and audit logs through `usePortalData`
- Access: Management workspace grant from `get_my_authorization()`

## Current maturity

Record search is connected to supplied legacy collections. Most dashboards, financial metrics, policies, people, legal entities, and acquisition views are static demonstration content. There are no management-specific backend services or tables in the repository.

The obsolete hidden second sidebar was removed; `ManagementSidebar` is the sole navigation implementation.

## Direction

Before making a view transactional, establish its real entity owner, inputs, permissions, RLS policy, audit requirements, and server-side rules. Do not create database entities merely from labels in the current shell.

