# Supabase setup

Use [development setup](docs/development/setup.md) for local configuration and [database architecture](docs/architecture/database.md) for schema changes.

Normal browser development needs only:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-legacy-anon-key
```

Copy [`.env.example`](.env.example) to `.env.local` and never commit the result. Never place a service-role value in a `VITE_*` variable.

The source of truth is `supabase/migrations`. Do not execute the root `supabase_*.sql` snapshots. Permission/RLS/provisioning changes require explicit approval and staging verification.
