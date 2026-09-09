# COS architecture

The canonical architecture documentation is under [docs/architecture](docs/architecture/overview.md).

COS is one React/Vite SPA backed by Supabase Auth, PostgreSQL/Data API/RPC, and the `admin-user-provisioning` Edge Function. It has no conventional Node API server and no monorepo. Start with:

- [System overview](docs/architecture/overview.md)
- [Frontend](docs/architecture/frontend.md)
- [Backend boundary](docs/architecture/backend.md)
- [Database](docs/architecture/database.md)
- [Module ownership](docs/modules/overview.md)
- [Full audit](docs/audit/2026-09-09-codebase-audit.md)
