## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase Setup

1. Copy `.env.local.example` to `.env.local` and fill the values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key
```

2. In your Supabase project, open the SQL Editor and run `supabase_schema.sql` (provided in the repo) to create the tables the app expects.

3. Seed the demo data (optional but recommended) with:

```
npm run seed
```

4. If you have Row Level Security enabled, apply the policy in `supabase_rls.sql` before seeding or runtime writes.

5. Start the dev server:

```
npm run dev
```

Notes:

- Ensure your Supabase project's allowed origins include your dev host (e.g. `http://localhost:3000`).
- Do not commit real keys; keep them in `.env.local` which should be ignored by git.
