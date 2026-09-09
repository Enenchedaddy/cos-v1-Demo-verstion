# Backend and server-side boundary

COS does not contain Express, Next.js API routes, controllers, queues, cron jobs, email services, or background workers. Its backend capabilities are Supabase-managed.

## Data API and RPC

PostgREST exposes permitted tables and PostgreSQL functions. This is the normal backend for authenticated browser reads and writes. The browser uses a publishable/anon key and a user JWT; RLS is mandatory for business authorization.

Important RPCs include:

- `get_my_authorization()`: returns the caller's active profile, global role, permissions, and allowed workspaces;
- `cs_issue_approval_token(...)`: issues a scoped Content & Social approval token after membership checks;
- `cs_client_approval(...)`: validates a one-time token, returns immutable versions, and records a client decision;
- staging bootstrap functions used only by guarded local scripts.

## User-provisioning Edge Function

`supabase/functions/admin-user-provisioning/index.ts` is the sole approved privileged user-management endpoint. It:

1. validates the request origin;
2. validates the caller JWT with a non-privileged Supabase client;
3. loads authorization through `get_my_authorization()`;
4. checks permissions and separation-of-duties rules;
5. uses the service-role client only inside the function;
6. records provisioning audit events;
7. returns a correlation/request ID while keeping internal errors out of the response.

Supported actions are list requests/users, create or cancel a request, CEO approve/reject, send/resend invitation, activate an invitation, edit a profile, change a role, and enable/disable an account.

## Known server-side limitations

Invitation, profile, request, and audit updates span Auth and PostgreSQL and are not one database transaction. A network or downstream failure can leave partial state, so failures include correlation IDs and must not be retried blindly. A future approved design should add idempotency and explicit compensation/reconciliation.

No generic route/controller/service/repository folders are created because there is no generic server application. If COS adds multiple Edge Functions, shared validation and response helpers can then move to `supabase/functions/_shared`.

