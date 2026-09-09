# Frontend architecture

## Entry and routes

`src/main.tsx` mounts one `AuthorizationProvider` and `AppRouter`. Routing is intentionally dependency-free and exact-path based.

| Path | Access | Component |
| --- | --- | --- |
| `/`, `/login` | Public; authorized sessions redirect | `LoginPage` |
| `/password-recovery` | Public | `PasswordRecoveryPage` |
| `/auth/confirm` | Public Auth callback | `AuthConfirmationPage` |
| `/password-update`, `/auth/complete` | Supabase recovery/invitation session | `PasswordSetupPage` |
| `/client-approval?token=…` | Public token-authorized | `ClientApprovalPortal` |
| `/app` | Authenticated | Workspace gateway |
| `/app/sales-marketing` | Workspace grant | Sales & Marketing |
| `/app/management` | Workspace grant | Management |
| `/app/users` | `users.view` | User provisioning |

Legacy `?workspace=sales|marketing|management` and `?client_approval=…` links remain compatible.

## State and data

- `AuthorizationProvider` is the only global context. It owns session-derived authorization, not credentials.
- `usePortalData` owns legacy table reads/writes, loading/error states, and snake_case conversion.
- `useContentSocial` owns Content & Social workflow state and delegates persistence to its feature repository.
- Local component state controls navigation, filters, modals, and visual simulations.
- No Redux-style store is present or warranted by current usage.

Production data failures yield explicit empty, unavailable, unauthorized, or error states. Fixtures require both a development build and `VITE_COS_ALLOW_DEMO=true`.

## UI ownership

`src/components` still contains shared primitives and the two large workspace shells. `src/content-social` is the reference feature boundary. Navigation definitions live separately because sidebar components and capability filters both consume them.

The three large workspace implementations are loaded with `React.lazy` only when selected. This keeps the shared entry bundle below Vite's 500 kB warning threshold while preserving the single-application deployment.

The two largest remaining frontend debts are `DesignSystemPlatform.tsx` and `ManagementPlatform.tsx`; split them only when active routes gain independent behavior. `ContentSocialModule.tsx` should be formatted and divided into route-level views before substantial feature expansion.

## Error contract

Data adapters throw or expose errors; UI event handlers may intentionally absorb a handled error only after the adapter updates visible status. A Supabase response must always inspect its `error` field—JavaScript `try/catch` alone does not detect PostgREST errors.
