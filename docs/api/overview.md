# API surfaces

COS uses Supabase APIs rather than a custom REST server.

## Browser-facing surfaces

| Surface | Authentication | Purpose |
| --- | --- | --- |
| Supabase Auth client | Publishable key; session where applicable | Sign-in, recovery, confirmation, session refresh, sign-out |
| PostgreSQL Data API | User JWT + RLS | Legacy records and Content & Social collections |
| `get_my_authorization()` | Authenticated user | Effective profile, role, permissions, workspaces |
| `cs_issue_approval_token(...)` | Authenticated scoped member | Create a short-lived client approval token |
| `cs_client_approval(...)` | Possession of one-time token | Read exact versions or record a decision |
| `admin-user-provisioning` | Authenticated user + server checks | Governed account lifecycle |

## Edge Function request contract

The browser invokes the function with JSON:

```json
{
  "action": "list_requests"
}
```

Other actions add the fields required by that operation. The TypeScript action union and response models live in `src/auth/userProvisioning.ts`.

Success:

```json
{
  "data": {},
  "requestId": "correlation-id"
}
```

Failure:

```json
{
  "error": "The requested provisioning action could not be completed.",
  "code": "REQUEST_REJECTED",
  "requestId": "correlation-id"
}
```

The function currently returns HTTP 400 for handled provisioning rejections and 401 for missing authorization. Internal database/Auth details are logged server-side without email addresses in the error log payload.

## Data naming

PostgreSQL requests/responses are snake_case. Feature adapters translate to camelCase application models. Code must check Supabase's returned `error` on every call; a fulfilled promise can still represent a PostgREST failure.

## Not present

There are no application-owned REST routes, GraphQL schema, webhooks, email endpoints, background-job APIs, or third-party integration endpoints. Do not document navigation labels as APIs.

