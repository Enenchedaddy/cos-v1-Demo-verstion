# Contributing to COS

1. Read [AGENTS.md](AGENTS.md), the [architecture overview](docs/architecture/overview.md), and the relevant module document.
2. Start from the current branch without discarding unrelated work.
3. Keep UI behavior in the owning feature and privileged behavior in Supabase Functions or PostgreSQL.
4. Use `public.get_my_authorization()` for browser authorization. Never hard-code identities, role assignments, or workspace grants.
5. Add a new immutable migration for database changes. Roles, permission assignments, RLS, and provisioning behavior require explicit project-administrator approval and staging verification.
6. Never commit `.env.local`, credentials, session tokens, generated reports, or service-role values.
7. Run `npm run lint`, `npm run test:run`, `npm run build`, and focused E2E checks before handoff.
8. Explain user-visible behavior, database effects, and unresolved risks in the change description.

Use PascalCase for React components, camelCase for TypeScript values, `useX` for hooks, snake_case for PostgreSQL objects, and timestamped snake_case migration names. More detail is in [development conventions](docs/development/conventions.md).
