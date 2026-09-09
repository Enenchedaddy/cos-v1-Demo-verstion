# Module ownership map

This map distinguishes working functionality from navigation labels and design direction.

| Module | Frontend owner | Server/database owner | Depends on | Current maturity |
| --- | --- | --- | --- | --- |
| Identity and access | `src/auth`, auth pages, route guards | Supabase Auth; profiles, roles, permissions; `get_my_authorization()` | Supabase session | Implemented |
| User provisioning | `UserProvisioningPage`, `auth/userProvisioning.ts` | `admin-user-provisioning`; provisioning tables | Identity, global permissions | Implemented, operational hardening remains |
| Sales & Marketing shell | `SalesMarketingPlatform`, sidebar/navigation definitions | Legacy companies/deals/campaigns/approvals/audit tables | Global permissions; legacy adapter | Partial |
| Content & Social | `src/content-social` | `cs_*` tables and RPCs | Scoped membership/RLS; visible inside Sales & Marketing | Broad domain implementation |
| Management shell | `ManagementPlatform`, Management sidebar/navigation | Reads legacy companies/orders/approvals/audit | Management workspace grant | Mostly presentation/static |
| Legacy operations | `types.ts`, `data.ts`, `usePortalData` | Eleven legacy tables | RLS policy design not complete | Demonstration/data skeleton |
| Design system | `DesignSystemPlatform`, shared components/CSS | None | `system.view` | Internal reference UI |

## Relationships

- Identity gates all employee routes and supplies global capabilities.
- Sales & Marketing uses company, deal, campaign, approval, and audit summaries.
- Content & Social is hosted inside Sales & Marketing navigation but does not inherit global business authorization. Its membership and RLS checks remain authoritative.
- Management searches companies, orders, approvals, and audit entries; most dashboard figures are currently static.
- User provisioning uses global permissions but is executed only by the server-side Edge Function.
- Client approval is a narrow public interface authorized by a short-lived token rather than an employee session.

## Navigation-only product direction

The Sales & Marketing sidebar names CRM, sales execution, commerce, campaigns, paid media, lifecycle, creators/partnerships, analytics, approvals, and settings. Many currently render a shared record shell instead of owning complete data models or services.

The Management sidebar names performance, governance, strategy, organisation, acquisitions, alerts/knowledge, and group administration. These are mostly static views. They must not be documented or sold as complete transactional modules until feature-owned logic, persistence, permissions, and tests exist.

