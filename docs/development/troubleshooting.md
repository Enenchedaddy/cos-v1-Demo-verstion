# Troubleshooting

## Workspace unavailable

Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present and restart Vite. Placeholder or missing values deliberately produce an unconfigured state.

For a static deployment, these variables must be present on the build machine before `npm run build`; Vite embeds the browser-safe configuration in the generated assets. Rebuild and replace the deployed artifact after correcting them. Production builds now reject missing, placeholder, secret, and service-role values.

## Signed in but no workspace

The account must have an active `profiles` row and valid `get_my_authorization()` result. Do not work around this in frontend state or assign a role by email. Ask an authorized administrator to inspect the governed provisioning state.

## Empty legacy dashboards

The live legacy tables may genuinely be empty, and current RLS policies deny browser access. Fixtures appear only when `VITE_COS_ALLOW_DEMO=true` in a development build. An empty production view is preferable to invented business records.

## Content & Social restricted/unavailable

Verify the user has a matching `cs_memberships` scope for workspace, client, and brand. The 2026-09-09 audit also identified malformed live scope-selection policies; correct them only through an approved migration and staging tests.

## Provisioning request rejected

Capture the displayed reference/correlation ID. Inspect the Edge Function and provisioning audit logs. Auth and database steps are not atomic, so do not resend or rerun a bootstrap blindly.

## Public approval link opens login

Use the canonical `/client-approval?token=…` route. Legacy `client_approval` query links are accepted only on the public approval route or historical `/app…` links.

## Vite/Vitest esbuild access error

In restricted Windows sandboxes, esbuild may fail while resolving or reading a parent directory before it loads configuration. Run the same command in the normal repository shell or grant the build tool access to its required parent paths. This is distinct from a TypeScript or test assertion failure.

## E2E tests are skipped

Set an approved controlled `COS_E2E_EMAIL` and `COS_E2E_PASSWORD`. The public client approval route check runs without them; employee workspace tests must not invent credentials.

## Seed refuses to run

This is intentional if the project reference differs, confirmation is absent, credentials lack access, or any target table is non-empty. Resolve the condition and inspect any partial state; do not weaken the guard.
