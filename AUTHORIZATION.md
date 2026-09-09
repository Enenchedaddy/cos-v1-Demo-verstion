# COS authorization

The canonical security and identity documents are:

- [Security model](docs/security/overview.md)
- [Identity and provisioning](docs/modules/identity-and-provisioning.md)
- [Architecture overview](docs/architecture/overview.md)

Supabase Auth owns identity and sessions. Browser authorization comes only from `public.get_my_authorization()`. Valid global roles are `CEO`, `MANAGEMENT`, `SALES`, `MARKETING`, and `SOFTWARE_ENGINEER`. Content & Social memberships remain separate from global RBAC, and RLS/server checks are authoritative.

The 2026-09-09 audit found approval-gated live drift in the SOFTWARE_ENGINEER workspace mapping and two Content & Social membership policies. Do not work around these issues in the client or change them without explicit approval, migrations, and staging verification.
