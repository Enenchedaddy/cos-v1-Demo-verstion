# Social Publisher on a hosted staging website

COS can run on a hosted website; localhost is not a frontend requirement. This guide describes configuration and connection checks, **not evidence that a hosted deployment or real Instagram publishing has passed testing**.

Work only with the confirmed staging project `bppjneljqonuouleptgs`. Do not change production, permissions, memberships or RLS. Keep the publishing scheduler inactive throughout this connection-only test.

## 1. Confirm the staging website

Choose one approved, stable **HTTPS origin**, for example `https://cos-staging.example.com` (illustration only; use the actual staging address). An origin contains the scheme and hostname, plus a non-default port if used. Do not include `/app`, a query string, credentials, a trailing slash or a wildcard.

Confirm that the hosting destination and its Git branch are staging/preview before pushing or deploying; a push to a production branch can trigger a production release.

Build the hosted frontend with:

| Build variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://bppjneljqonuouleptgs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | This staging project's browser-safe publishable or legacy anon key |

Never put the Instagram app secret, access tokens, worker token or Supabase service-role key in frontend variables. Disable development fixture mode. Run TypeScript checks, focused tests and a production build before staging deployment. The existing `vercel.json` already supplies SPA fallback routing; other hosts must serve `index.html` for application routes such as `/app/sales-marketing` and `/login`.

## 2. Point the publisher at that website

In **staging Supabase → Edge Functions → Secrets**, record the previous non-sensitive configuration for rollback, then verify:

| Server setting | Required configuration |
| --- | --- |
| `COS_PUBLISHER_EXPECTED_PROJECT_REF` | `bppjneljqonuouleptgs` |
| `COS_PUBLISHER_APP_ORIGIN` | The exact approved HTTPS staging origin |
| `INSTAGRAM_APP_ID` | ID from the Instagram Login setup; current staging app: `1091317650279554` |
| `INSTAGRAM_APP_SECRET` | Secret from the same Instagram Login setup, entered privately |
| `INSTAGRAM_API_VERSION` | Version confirmed in the Meta app; current setup selected `v26.0` |
| `COS_PUBLISHER_ENABLED` | Keep `false` while checking configuration; set `true` only for the approved connection test |

The current publisher supports **one configured origin at a time**. That origin controls both browser CORS and the destination after Instagram authorization. Changing it from `http://localhost:3000` to the hosted origin makes the hosted website the publisher client; localhost requests are then rejected. Do not enter a comma-separated list or enable arbitrary preview domains.

`COS_APP_ORIGIN` and `COS_ALLOWED_ORIGINS` belong to other COS flows. They do **not** replace `COS_PUBLISHER_APP_ORIGIN`. Do not overwrite them as part of this publisher change; review those flows separately if they also need hosted staging access.

Save server secrets in Supabase-managed configuration only. Secret-only changes take effect without redeploying functions; code changes still require a separately approved function deployment. See [Supabase Edge Function secrets](https://supabase.com/docs/guides/functions/secrets#production-secrets).

## 3. Keep the Instagram callback unchanged

Meta's **Instagram business login → Redirect URL** must remain:

```text
https://bppjneljqonuouleptgs.supabase.co/functions/v1/social-publisher-callback
```

This is the OAuth callback, **not a webhook URL**. The server exchanges the authorization code, saves the account connection and redirects to the configured hosted origin at `/app/sales-marketing`. Do not replace Meta's callback with the frontend URL.

COS sign-in and Instagram authorization are separate. Sign in to COS on the hosted website even if already signed in on localhost; their browser sessions are separate. Password-recovery and invitation links also have their own Supabase Auth/server redirect configuration. If those are needed on staging, review the exact allowed hosted paths separately rather than changing authentication defaults or adding broad wildcards. See [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

## 4. Run a connection-only smoke test

From the repository, run this credential-free check after substituting the approved staging hostname:

```sh
npm run check:publisher-origin -- --project-ref bppjneljqonuouleptgs --origin https://cos-staging.example.com
```

The command sends preflight checks and an empty unauthenticated request only; it never connects an account, creates a job or invokes the worker. A failure exits non-zero. Passing confirms origin/authentication boundaries, not Meta credentials, hosted routing or successful publishing. Browser connection testing is still required below. See [Supabase's browser CORS guidance](https://supabase.com/docs/guides/functions/cors).

1. Confirm the hosted `/login` and `/app/sales-marketing` routes load on direct navigation and refresh, using the staging backend.
2. Check that an `OPTIONS` request to `social-publisher` with the exact hosted `Origin` returns `204` and that same `Access-Control-Allow-Origin`. An unknown origin must be rejected; a `POST` without a signed-in session must be rejected.
3. Sign in to hosted COS. Open **Content & Social → Social Publisher** and select the intended company and brand. Existing scoped membership is still required to manage connections.
4. Select **Connect Instagram**, sign in to the approved professional test account and approve the requested basic/content-publishing access. Never share passwords, tokens or full OAuth callback URLs.
5. Confirm the return address is the hosted website, not localhost. Reopen Social Publisher if necessary, reselect the same company and brand, then select **Refresh results**.
6. Verify the correct account appears as **Connected** under that brand. An empty list or error is not a successful connection.

Do **not** select Publish now, schedule a post, invoke the worker or activate Cron. Enabling the service is not proof of publishing capability; staging accounts can still post real Instagram content if dispatch is activated. Connection success does not validate image delivery, scheduling or video support.

## 5. Roll back safely

If the connection test fails, record only the non-sensitive error and set `COS_PUBLISHER_ENABLED=false`. Restore the previous `COS_PUBLISHER_APP_ORIGIN` if reverting to local testing; only re-enable after verifying that intended client and keeping the scheduler inactive. Close any unfinished Instagram authorization tabs and start a fresh connection attempt after changing origin.

If a frontend release is faulty, restore the previous **staging** release. Preserve database history and account records; no destructive migration or permission change is needed. This guide makes no production changes and does not authorize a live post.
