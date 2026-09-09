# Identity and user provisioning

## Responsibility

This module authenticates employees, resolves their effective authorization, protects routes, and administers invitation-based accounts.

## Ownership

- Frontend: `src/auth/*`, authentication pages, `UserProvisioningPage.tsx`
- Server: `supabase/functions/admin-user-provisioning`
- Database: `profiles`, `roles`, `permissions`, `role_permissions`, `profile_permissions`, `user_provisioning_requests`, `user_provisioning_audit_logs`, authorization/bootstrap functions

## Authentication

Supabase Auth owns passwords, sessions, recovery links, invitation links, refresh tokens, and logout. COS has no public signup path and never stores credentials. The client restores the Supabase session and then calls `get_my_authorization()`.

## Global authorization

Only these role codes are valid: `CEO`, `MANAGEMENT`, `SALES`, `MARKETING`, and `SOFTWARE_ENGINEER`. Effective permissions combine role and individual grants in the database response. The browser never reads RBAC tables directly.

Route guards support either a workspace grant or a named permission. They are UX controls; database RLS and Edge Function checks are the security controls.

## Provisioning workflow

1. A caller with `users.request` creates a request for someone else.
2. An independent CEO reviews and approves or rejects.
3. A specifically authorized technical user sends the Supabase invitation.
4. The Edge Function creates the profile and associates the approved role.
5. The invitee follows the Auth confirmation/password flow and activates the account.
6. Every privileged action writes a provisioning audit event.

The CEO reviews but does not inherit technical invitation authority. Technical authority is individually granted and must not be inferred from the `SOFTWARE_ENGINEER` role.

## Public interface

The browser invokes the `admin-user-provisioning` function with an action and payload. Responses contain `data` and `requestId`. Errors expose a stable generic message/code and correlation ID, not internal details.

## Known risks

The current function cannot transact across Supabase Auth and PostgreSQL. Invitations may exist if a later profile/request/audit write fails. Operators must use the correlation ID and inspect state rather than blindly retrying.

