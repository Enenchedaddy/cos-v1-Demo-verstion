# Content and Social

## Responsibility

Content & Social models the lifecycle from an idea and brief through immutable platform versions, approval, scheduling, publishing, community/listening work, performance observations, notifications, and audit.

## Feature boundary

`src/content-social` contains:

- `model.ts`: Zod schemas and TypeScript domain types;
- `domain.ts`: workflow rules and permission checks;
- `repository.ts`: scoped Supabase/demo persistence;
- `useContentSocial.ts`: application orchestration;
- `ContentSocialModule.tsx`: current UI;
- `ClientApprovalPortal.tsx`: public token-based decision UI;
- `seed.ts`: development-only fixture state;
- focused unit/component tests.

Database objects use the `cs_*` prefix. Every business row is scoped by workspace, client, and brand. `cs_memberships` defines module roles independently from global RBAC.

## Approval invariant

An approval targets exact immutable version IDs. Creating a newer version makes affected pending approval context stale. External client decisions go through `cs_client_approval`, and successful one-time decisions revoke the token and append audit evidence.

Canonical public links use `/client-approval?token=…`. Legacy `client_approval` query links remain readable.

## Demo mode

Browser-local Content & Social fixtures require both a Vite development build and `VITE_COS_ALLOW_DEMO=true`. When disabled, missing authentication/configuration or service errors are explicit; production never silently substitutes business records.

## Current authorization defect

The live scope-selection policies for workspace/client membership contain ambiguous unqualified identifiers whose stored expressions compare membership columns to themselves or the wrong `id`. A corrective migration requires administrator approval and representative-member staging tests. Until then, valid scoped users may be unable to load the module.

