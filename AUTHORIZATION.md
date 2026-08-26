# COS authorization architecture

## Source of truth

Supabase Auth establishes identity. The staging `public.get_my_authorization()` RPC resolves the signed-in caller's active COS profile, global role, and active permissions. It accepts no user ID, derives identity from `auth.uid()`, and is the only RBAC data endpoint used by the browser.

The React authorization provider is an experience and navigation layer. PostgreSQL RLS remains the security boundary for data access.

## Global roles and workspaces

| Role | Sales & Marketing | Management |
| --- | --- | --- |
| CEO | Approved read/write permissions | Approved access |
| MANAGEMENT | Approved read visibility | Approved access |
| SALES | Sales capabilities | No access |
| MARKETING | Marketing capabilities | No access |
| SOFTWARE_ENGINEER | No business workspace by default | No access |

Sales and Marketing are one workspace. Its canonical URL is `/app/sales-marketing`; Management is `/app/management`. Legacy `/app?workspace=sales`, `/app?workspace=marketing`, and `/app?workspace=management` URLs normalize to canonical URLs and grant no access by themselves.

## Adding protections

- Add a permission only through an approved database migration and role-permission decision.
- Protect a workspace with `ProtectedRoute workspace=...`.
- Use `useAuthorization().hasPermission('module.action')` for UI actions.
- Never use email, localStorage, query strings, React state, or a role-name bypass as an authorization decision.
- Never expose service-role credentials in frontend code.

## Content & Social boundary

Content & Social retains its separate membership and module-role authorization model. It is intentionally not assigned global `content_social.*` permissions in this phase and is not surfaced by the global Sales & Marketing navigation until an approved membership-aware integration is implemented.

## Failure behavior

Missing profiles, malformed RPC responses, session failures, and RPC errors fail closed. Unauthenticated users go to `/login`; authenticated users lacking a workspace permission receive an access-denied state.

## Controlled user provisioning

`/app/users` requires `users.view` and presents a dual-approval workflow. CEO approval is required before technical approval; only an active SOFTWARE_ENGINEER with individually granted `users.invite` can send the Supabase invitation. CEO approval never grants invitation authority, and other SOFTWARE_ENGINEER users do not inherit Jeremiah's individual provisioning permissions.

The browser invokes the JWT-protected `admin-user-provisioning` Edge Function. It independently resolves the caller through `get_my_authorization()`, refuses self-approval and self-administration, and enforces PENDING → CEO_APPROVED → READY_FOR_INVITATION → INVITATION_SENT → ACCOUNT_ACTIVATED server-side.

The service-role key exists only in the Edge Function environment. The browser never writes `profiles`, `roles`, `permissions`, `role_permissions`, `profile_permissions`, `user_provisioning_requests`, or `user_provisioning_audit_logs` directly. The only approved global roles remain CEO, MANAGEMENT, SALES, MARKETING, and SOFTWARE_ENGINEER.

The first technical provisioning administrator and CEO use separate, service-role-only, one-time staging bootstraps. Neither bootstrap creates a password; the invited identity completes secure password setup before it can authorize.
