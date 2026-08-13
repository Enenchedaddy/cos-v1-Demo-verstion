# Content & Social deployment runbook

## Environment

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment environment. Do not set `VITE_COS_ALLOW_DEMO=true` in production. Never expose a service-role key in browser code.

## Database

`supabase_content_social.sql` has been applied to Supabase project `bppjneljqonuouleptgs`. It creates an isolated `cs_*` domain, RLS policies, explicit grants, lifecycle guards, immutable versions, proof enforcement, audit records, and secure client-approval functions.

## First authorised user

Invite the user through Supabase Authentication. After acceptance, insert a membership from an administrative database session:

```sql
insert into public.cs_memberships (
  id, user_id, workspace_id, client_id, brand_id, role, display_name
) values (
  gen_random_uuid(), '<auth-user-uuid>',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'CS_MANAGER', 'Aisha Bello'
);
```

The project currently has zero Auth users, so this invitation and membership assignment are required before production data entry. Development mode intentionally uses visibly labelled browser-local demo data.

## Operational integrations

Drive/Canva/CapCut and social-network adapters remain external Launch integrations. The module currently supports governed external asset links, manual publishing with proof, and sourced metrics. Connector credentials must live in Supabase Vault/Edge Function secrets and should be added only after vendor accounts, scopes, callback URLs, and approvals are available.

## Release verification

Run `npm run lint`, `npm run test:run`, `npm run test:e2e`, `npm run build`, and `npm audit`. After schema changes, rerun Supabase security and performance advisors. Fresh indexes appear as “unused” until production queries exercise them; that is expected.
