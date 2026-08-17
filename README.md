# Brand Circuit Central Operating System

## Local development

Prerequisite: Node.js 18 or newer.

```bash
npm install
npm run dev
```

The application runs with typed in-memory demo data by default. To enable Supabase persistence, create `.env.local` with:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key
```

`SUPABASE_KEY` is only for `npm run seed`; it must never be exposed with a `VITE_` prefix or committed.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Vite development server on port 3000. |
| `npm run build` | Create a production build. |
| `npm run lint` | Run the TypeScript type check. |
| `npm run test:run` | Run the Vitest suite once. |
| `npm run test:e2e` | Run Playwright browser tests. |
| `npm run seed` | Seed Supabase when the required server-side variables are present. |

## Architecture and deployment

Read [ARCHITECTURE.md](ARCHITECTURE.md) for ownership boundaries, the directory map, data flow, and contribution guidance. Read [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and [CONTENT_SOCIAL_DEPLOYMENT.md](CONTENT_SOCIAL_DEPLOYMENT.md) before connecting or deploying Supabase.
