# Security model

## Trust boundaries

- Supabase Auth owns employee identity, passwords, recovery, invitations, and sessions.
- The browser contains only a publishable/anon project key. That key identifies the project; it is not authorization.
- `get_my_authorization()` is the browser's only global RBAC snapshot.
- PostgreSQL RLS is authoritative for Data API operations.
- The user-provisioning Edge Function is the only service-role boundary.
- Content & Social membership is independent from global RBAC.
- Client approval is authorized by a high-entropy, short-lived, revocable one-time token.

## Required invariants

Never create public signup, store credentials, infer access from email, query RBAC tables from the browser, or place a service-role value in frontend variables/source/storage/logs/tests. Only five global roles are allowed. CEO approval and technical invitation authority remain separate.

Frontend route/capability checks prevent confusing UI but do not replace RLS or server checks. Demo data requires an explicit development-only flag and must never appear as a production fallback.

## Audit results (2026-09-09)

No tracked source or documentation matched the actual values in the ignored local environment file, and no obvious committed Supabase JWT/key pattern was found. The local secret file remains ignored.

Critical authorization defects were found but not changed because policy and role changes require explicit approval:

1. The live `get_my_authorization()` workspace mapping grants every `SOFTWARE_ENGINEER` both business workspaces, conflicting with the documented staging-interface-only authority.
2. Live `cs_workspaces_member_select` and `cs_clients_member_select` policy expressions contain ambiguous identifiers that PostgreSQL resolved to incorrect membership self-comparisons.

Other live advisories:

- legacy business tables have RLS enabled with no policies; access denies by default, but table grants and intended ownership need an approved policy design;
- several security-definer RPCs are executable by broad API roles. This is expected only for their deliberately narrow entry points and must be preserved with strict internal checks and fixed search paths;
- Auth OTP expiry exceeds one hour and leaked-password protection is disabled;
- eight foreign-key columns lack supporting indexes;
- `cylinder_balances` has no primary key;
- many indexes are reported unused, but empty/new tables make deletion unjustified.

Advisor references: [RLS enabled without policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [anonymous security-definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated security-definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [production Auth security](https://supabase.com/docs/guides/platform/going-into-prod#security), [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), [unindexed foreign keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys), [missing primary keys](https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key), and [unused-index interpretation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

## Web risks

React renders text without raw HTML in the audited paths, reducing direct stored-XSS exposure. External asset links use `rel="noreferrer"`. The deployment currently lacks a documented Content Security Policy and other explicit security headers. Client approval tokens in URLs can leak through history or copied links; keep expiry short, revoke after use, and add a no-referrer policy as a hardening task.

## Change control

Any permission, role-assignment, RLS, security-definer function, or provisioning behavior change requires:

1. explicit project-administrator approval;
2. an immutable deterministic migration;
3. staging tests with representative roles and scoped memberships;
4. negative tests for unauthorized access;
5. Supabase security/performance advisor review;
6. a documented rollback or forward-fix plan.
