# Development conventions

## Naming

- React components and component files: PascalCase
- Hooks: `useX`
- TypeScript variables/functions: camelCase
- Types/interfaces: PascalCase
- Feature folders: kebab-case where multiple words are needed
- PostgreSQL tables, columns, functions, policies: snake_case
- Migrations: `YYYYMMDDHHMMSS_snake_case_description.sql`
- Environment variables: uppercase snake case; browser-visible variables require `VITE_`

## Boundaries

- `src/app`: application composition, routing, cross-feature adapters
- `src/auth`: shared identity/authorization behavior
- `src/components`: truly shared UI or current unsplit workspace shells
- `src/<feature>`: domain model, rules, persistence, hooks, views, tests
- `src/navigation`: declarative workspace navigation shared by shells/sidebars
- `supabase/migrations`: authoritative database history
- `supabase/functions`: privileged server code
- `scripts`: guarded operational utilities

Do not create generic controllers/services/repositories without a server application or a repeated need. Keep feature-specific rules in the feature.

## TypeScript and React

Use type-only imports when an import has no runtime value. Keep Supabase responses behind typed adapters. Prefer pure exported helpers for business rules and test them directly. Effects synchronize external systems; event handlers own user actions. Do not use browser storage or URL state as authorization truth.

## Supabase

Inspect `data` and `error` explicitly on every operation. Browser code may use only a publishable key and user session. Use `get_my_authorization()` for global authorization and keep Content & Social membership separate. Treat RLS as the final data boundary.

Applied migrations are immutable. Permission and policy changes require explicit approval. Server logs should use correlation IDs and stable categories, not secrets or unnecessary personal data.

## Comments and documentation

Comments explain security constraints, business invariants, or non-obvious tradeoffs—not syntax. Update module/API/security documentation when behavior or ownership changes. Mark demo/navigation-only behavior plainly.

## Definition of done

Run TypeScript, focused tests, the full unit suite, production build, and relevant E2E paths. Report skipped tests and environmental blockers. Do not commit, push, or deploy without explicit approval.

