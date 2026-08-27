# COS engineering agent rules

- Inspect relevant code, migrations, Supabase schema, RLS, and Git state before changing authentication, authorization, or database code.
- Supabase Auth owns credentials and sessions. Never create public signup, store passwords, or place service-role credentials in browser code.
- Use `public.get_my_authorization()` for browser authorization state. Do not query RBAC tables directly from the client or hard-code users, emails, roles, or workspaces.
- Roles are limited to CEO, MANAGEMENT, SALES, MARKETING, and SOFTWARE_ENGINEER unless the project administrator approves a migration.
- Permission and role-assignment changes require explicit approval, deterministic migration files, staging verification, and no destructive schema changes.
- Protect routes and actions through centralized permission checks; client checks improve UX but RLS remains the data-security boundary.
- Keep Content & Social membership authorization separate from global RBAC unless an integration design is approved.
- Do not use localStorage, sessionStorage, URL parameters, or frontend state as authorization truth.
- Run TypeScript, focused tests, and a production build before handoff. Do not commit, push, or deploy without explicit approval.
- User provisioning is server-side only. The `admin-user-provisioning` Edge Function is the sole approved path for requests, approvals, invitations, profile edits, role changes, and account status changes. Never use an email address as runtime authorization.
- Do not add an ADMIN, SOFTWARE_LEAD, or FRONTEND_ENGINEER RBAC role. User provisioning uses dual approval: CEO has review/approval only; individually granted technical authority is never inherited by every SOFTWARE_ENGINEER.
- Never place `SUPABASE_SERVICE_ROLE_KEY` in Vite variables, frontend source, repository files, browser storage, logs, or test fixtures. Edge Function secrets must remain in Supabase-managed server configuration.
- Legacy portal fixtures are development-only and require `VITE_COS_ALLOW_DEMO=true` in a development build. Production must show explicit data states rather than fallback business records.
- `testing.sales_marketing_interface.view` is a staging/build-only capability for inspecting Sales & Marketing navigation, including Content & Social navigation. It grants no business action, database, Content & Social data, or user-provisioning authority; Content & Social data remains controlled by scoped memberships and RLS. It must not be treated as a production developer bypass.
