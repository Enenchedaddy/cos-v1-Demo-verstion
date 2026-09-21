# Company, brand and Instagram publisher

Implemented in **Sales & Marketing → Content & Social → Social Publisher**. Company/brand selection is shared by Content & Social so briefs, approvals, calendars and publishing use the same authorized context.

## Release status

With explicit user approval on 2026-09-21, migration `20260921161039_company_brand_social_publisher` was applied to the confirmed staging project `bppjneljqonuouleptgs`. All three publisher Edge Functions were deployed at version 1 and report ACTIVE. The local migration filename matches the version recorded by the deployment service; its reviewed SQL is unchanged. Production was not modified.

The updated frontend can now load the company/brand directory and publisher metadata. Existing active scoped members were checked against the directory RPC with the authenticated database role. All three existing memberships are unchanged (full-row fingerprints match before/after). No test companies, provider tokens or publishing records were retained: integration fixtures were rolled back, both before activation and again against the installed schema.

Meta credentials, publisher environment secrets, account connection and Cron activation remain outstanding; real publishing is disabled by the fail-closed server configuration. No frontend hosting deployment was performed; the user's already-running updated frontend uses this staging backend. Refresh and open Content & Social → Social Publisher. Seeing the page does not grant additional scopes or company-onboarding authority.

## Delivered behavior

- Authorized company → brand → Instagram account selectors; context changes discard the previous brand's in-memory view and drafts.
- Company/brand onboarding through existing scoped `CS_MANAGER`/`MODULE_ADMIN` memberships. Creating a company requires workspace-level authority; creating a brand requires authority over its company. No new global roles or automatic membership assignments.
- Existing `cs_clients` is the company entity; `cs_brands` remains its child. Sales customer `companies` is unchanged.
- JPEG image/caption posts created from an approved Instagram/Static brief, stored as the existing content item, variant and immutable version.
- Image-rights confirmation, server-side JPEG validation, immutable private storage and exact-version image previews, including secure external approval links.
- Existing approval screens and client-token approval remain available. Versions and approval commands are transactional; changes invalidate old approvals.
- Instagram OAuth connection/reconnection/disconnection; no passwords or native platform credentials are exposed to staff.
- Publish now, timezone-aware scheduling, cancellation, safe retries and provider-confirmed results. The browser may close after queuing.
- Manual schedules, proof records and other Content & Social screens are preserved. Instagram connector rows cannot be edited as manual results.

## Database and authorization

Migration: `supabase/migrations/20260921161039_company_brand_social_publisher.sql`.

- Corrects the existing company/workspace visibility predicates; adds the composite brand/company relationship constraint without renaming or deleting data.
- Adds public, RLS-protected metadata tables: `cs_social_accounts`, `cs_publisher_media`, `cs_publisher_jobs`, `cs_publisher_attempts`. Browser access is SELECT-only.
- Adds `cs_content_versions.publisher_media_id` and `cs_schedules.social_account_id`; historical rows remain valid.
- Adds private credentials, OAuth-state and job-runtime tables; provider tokens are encrypted in Vault, not public account rows.
- Adds the private `cs-publisher` Storage bucket. Browser users have scoped reads only; uploads go through the authenticated Edge Function and cannot overwrite existing objects.
- Adds `cs_company_directory()` and `cs_publisher_command(action,payload)` as checked browser RPCs. `cs_publisher_service(action,payload)` is **service-role-only** and must never be granted to browser roles or logged.
- Global authorization continues to use `get_my_authorization()`. Directory visibility does not change Content & Social membership or RLS.
- Existing write responsibility policies remain. Additional restrictive active-profile/member checks protect publisher-related legacy tables from suspended users with unexpired JWTs.
- Approval targets must match the content item's company/brand. Direct REST writes cannot forge a connector result or let an approval-request-only role decide an approval.
- Creating posts uses `CS_MANAGER`/`PLANNER`; creating versions uses `CS_MANAGER`/`CONTRIBUTOR`; requesting approval uses the existing database-authorized `CS_MANAGER`/`ACCOUNT_BRAND`; deciding uses scoped `CS_MANAGER`/`CLIENT_APPROVER`; connector publishing uses `CS_MANAGER`/`SOCIAL_COMMUNITY`. No employee provisioning endpoints or role assignments were changed.

The initial staging accounts have brand-level memberships only. Company onboarding intentionally remains unavailable until a separately approved workspace-manager/module-admin assignment is completed through the approved administrative process. Do not promote all software engineers or use the staging navigation capability for this purpose.

## Staging activation after approval

1. **Completed:** reviewed migration applied to the exact staging project above. Do not reapply it or execute historical root SQL snapshots.
2. **Completed:** `social-publisher`, `social-publisher-callback` and `social-publisher-worker` deployed. `supabase/config.toml` disables gateway JWT verification for these functions because their handlers explicitly verify user sessions, single-use OAuth state, or a separate worker secret. `admin-user-provisioning` remains unchanged.
3. Configure these **Supabase-managed Edge Function secrets**, not `.env.local` frontend values or committed files:
   - `COS_PUBLISHER_EXPECTED_PROJECT_REF`: confirmed staging project reference.
   - `COS_PUBLISHER_APP_ORIGIN`: the exact allowed application origin; prefer HTTPS outside localhost.
   - `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`: the approved Meta application.
   - `INSTAGRAM_API_VERSION`: an explicit supported version such as `v25.0`, verified against the application's Meta settings.
   - `COS_PUBLISHER_WORKER_TOKEN`: a cryptographically random server-only secret, at least 32 characters.
   - `COS_PUBLISHER_ENABLED`: set to `true` only for the approved test environment.
   Supabase's server-provided URL, anon key and service-role key remain in server configuration. Never copy the service-role key into Vite variables, tests or source.
4. Configure the Meta app for Instagram Login and `instagram_business_basic` / `instagram_business_content_publish`. Register `https://bppjneljqonuouleptgs.supabase.co/functions/v1/social-publisher-callback` as the exact OAuth callback. Use an authorized Business/Creator test account and complete any required tester invitations, account permissions and app review. See [Meta's Instagram Login documentation](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login).
5. Store `cos_publisher_project_url` and `cos_publisher_worker_token` in Supabase Vault. The latter must match the worker's Edge Function secret. Set `cos.expected_project_ref` in the SQL session, review and run `supabase/operations/enable_social_publisher.sql` only in staging. It activates a named one-minute Cron job using pg_net. It is not part of the automatic schema migration.
6. Deploy the matching frontend through the separately approved staging workflow. Connect a real test account from its correct brand. Create/review/approve a test image, publish once immediately, then schedule a second version five minutes ahead. Close COS and verify the Instagram permalink, database evidence and audit record. Do not report real delivery verified before this test passes.

## Worker reliability and operational limits

- Each invocation claims one due job using row locking and a two-minute lease. Additional invocations may run concurrently; one job cannot be claimed twice while leased.
- Provider container IDs are checkpointed. Content, current approval, account state and the scheduling user's active scoped authority are rechecked immediately before dispatch.
- Pre-dispatch transient failures use bounded exponential retry, up to five attempts per retry cycle. Authorized manual retry is allowed only for confirmed pre-dispatch failures after revalidation.
- Once publishing starts, an ambiguous timeout or lost lease becomes `NEEDS_REVIEW`, not a blind retry. A known provider media ID is retained. Reconcile it on Instagram before deciding on any replacement post; automatic reconciliation/reposting is intentionally not enabled.
- Expiring tokens are refreshed during job processing. An idle account whose token has already expired must be reconnected. Reels, carousels, TikTok, bulk cross-account posting, analytics collection and native account access are outside v1.
- Check job/attempt status and Cron run history for failures. Logs and user-visible errors must never contain provider tokens, signed image URLs, service credentials or raw provider payloads.
- Stop dispatch by setting `COS_PUBLISHER_ENABLED=false` and unscheduling `cos-social-publisher`. Retain additive schema and history; do not use destructive rollback or delete published evidence. Already in-flight external requests may still complete and must be reconciled.

## Verification and remaining inputs

Verified on 2026-09-21:

- `npm run lint`: TypeScript passed.
- `npm run test:run`: 20 files, 98 tests passed.
- `npm run test:e2e`: 12 passed, 10 credential-dependent tests skipped. Eight passing cases exercise the new publisher on desktop/mobile using mocked transport; no approved login credentials or real provider credentials were supplied.
- `npm run build`: production compilation passed; the isolated browser fixture is not emitted in the production build.
- `deno check`: all three new Edge Functions passed.
- Candidate migration plus `supabase/tests/social_publisher.sql`: passed in a staging transaction ending in rollback, including changes-requested flags. After approved activation, the same integration suite passed against the installed schema with all fixtures rolled back.
- Existing-member checks: all active scoped principals can load authorized company/brand directory entries and read scoped publisher tables as the authenticated role. Existing membership fingerprints match before/after activation.
- Live HTTP smoke checks: directory RPC is recognized and denies anonymous access (`401` / `42501`, not missing-function `PGRST202`). All three Edge Functions respond; publisher/worker reject requests while configuration is absent. No accounts, provider credentials or jobs were created.
- The running local frontend responds at `http://127.0.0.1:3000`. Browser automation is isolated from the user's signed-in session; the user's final authenticated screen must be confirmed after refresh. The 12 passing browser checks include mocked publisher flows, not real Instagram delivery.
- `git diff --check`: passed. No commit, push, production deployment, Cron activation or real Instagram post was performed. Only the approved staging migration and three Edge Functions were deployed.

Automated checks cover TypeScript, production compilation, provider-adapter errors, media/timezone rules including DST gaps and repeated hours, multiple scoped memberships, directory/onboarding controls, mobile layout, mocked browser queue/create flows and transactional database/RLS flows.

`supabase/tests/social_publisher.sql` must run with the candidate migration in a single explicit transaction ending in **ROLLBACK**. It creates temporary test scopes/memberships against an existing active principal; never run it as a committed migration. It tests onboarding isolation, OAuth replay, server-only credentials, approved-version queuing, idempotency, concurrent claims, truthful results, stale approvals, access revocation and uncertain outcomes. No external provider is called.

`e2e/fixtures/social-publisher.html` is an isolated development test entry, excluded from the production build. Its transport mocks all backend calls; DE Labs and Quicks Supplements UK are fixtures only. Browser tests are not evidence of real Meta publishing.

Business/marketing inputs still required: approved workspace onboarding administrator, company/brand mappings, brand timezones, account owners, approvers, controlled test account and an approved image/caption. Existing employee provisioning remains the sole approved server-side process; this feature does not provision users or grant memberships.

The post-activation security advisor was reviewed. The three new private server-only tables report informational [RLS-without-policy notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), intentionally denying browser access. No new public SECURITY DEFINER warnings were introduced. Existing notices still cover legacy service-only tables, deliberately token-protected approval RPCs, long email OTP expiry and disabled leaked-password protection. These pre-existing configuration items were not silently changed. Review [OTP/security settings](https://supabase.com/docs/guides/platform/going-into-prod#security) and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) separately before production rollout.
