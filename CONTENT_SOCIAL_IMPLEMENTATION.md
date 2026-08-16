# Content & Social implementation baseline

Date: 13 August 2026  
Scope: Sales & Marketing Platform -> Content & Social only

## Authority and conflict decisions

- Documents 01-10 are the product, permission, workflow, information architecture, data, API, UX, visual, engineering, and QA authorities.
- The Sales & Marketing General Overview controls the containing workspace and its 13-area navigation.
- The user's later UI direction overrides older visual conflicts: Montserrat headings, Inter interface text, JetBrains Mono numbers; the `#061B3A` / `#0B3672` dual rail; `#F7F9FC` canvas; and rounded COS cards.
- Launch uses manual/link/CSV adapters for publishing, community, listening, analytics, assets, and AI. Direct social APIs are Scale work and are not fabricated at Launch.
- The repository's Vite/React/Supabase architecture is retained. The Document 09 Next.js recommendation is treated as a target architecture, not authorization for an unrelated application rewrite.
- Supabase Auth plus tenant-scoped RLS is authoritative for production. Local demo persistence is development-only and is visibly identified in the UI.

## Codebase gap summary

| Requirement | Source | Baseline status | Frontend work | Backend/database work | Implementation status |
| --- | --- | --- | --- | --- | --- |
| Eleven Content & Social areas | 01, 04, 07, 08 | Navigation labels only | Route-specific workspaces | Scoped domain repository | Implemented |
| Workspace/client/brand isolation | 02, 05, 06, 09, 10 | Missing | Scope-aware queries and restricted state | Memberships, foreign keys, RLS | Implemented |
| Ideas and governed briefs | 01, 03-07 | Missing | Create/submit/approve/convert views | Ideas, briefs, validation, audit | Implemented |
| Production lifecycle and exceptions | 01, 03, 05-10 | Static generic records | Pipeline, transitions, inspector | Server-enforced transition graph and exception flags | Implemented |
| Immutable variants and versions | 01, 03, 05, 06, 09, 10 | Missing | Version history and creation | Immutable versions and lineage | Implemented |
| Exact-version approvals | 01-10 | Commercial approval model only | Approval queue, decisions, stale state | Targets, decisions, invalidation, audit | Implemented |
| Secure client approval link | 01-03, 06, 07, 09 | Missing | Public exact-version review and decision page | Hashed one-time tokens, expiry/revocation and stale-version guard | Implemented |
| Calendar and scheduling | 01, 03-10 | Missing | Calendar/list and schedule workflow | Schedule records and prerequisites | Implemented |
| Manual publisher truth | 01, 03-10 | Missing | Queue, external action, proof/failure | Publish records; proof required for Published | Implemented |
| Linked assets and rights | 01, 03-10 | Missing | Asset catalogue and source links | Asset/version/rights/usage records | Implemented |
| Manual community register | 01, 03-10 | Missing | Triage, ownership, escalation | Scoped records and conversion lineage | Implemented |
| Manual listening register | 01, 03-10 | Missing | Signal capture, severity, conversion | Scoped signals and source evidence | Implemented |
| Performance and scorecards | 01, 02, 05-10 | Campaign ROI only | Verified/manual metrics and summaries | Metric source/verification fields | Implemented |
| Search, filtering, states | 01, 04, 07-10 | Generic search/simulator | Real module search and state surfaces | Scoped query/failure handling | Implemented |
| Notifications | 01, 03, 05, 06, 09, 10 | Visual bell only | Inbox/read state | Scoped notification records | Implemented |
| Archive/recycle/restore | 01, 03, 05, 06, 09, 10 | Missing | Archive lifecycle is available | Soft-delete/restore metadata is present | Partial; recycle-bin UI deferred |
| Immutable audit | 01-06, 09, 10 | Mutable generic log table | Audit activity view | Append-only module audit and triggers | Implemented |
| Authentication/authorization | 02, 06, 09, 10 | Simulated gateway | Production sign-in gate; demo indicator | Supabase Auth memberships and RLS | Implemented |
| Loading/empty/error/restricted/mobile | 01, 07-10 | Generic simulator only | Route-level states and responsive layouts | Predictable repository errors | Implemented |
| Automated QA and release gates | 10 | No test dependencies | Component and responsive browser smoke | Domain tests, live RLS/advisor audit | Implemented |

## Delivery slices

1. Domain types, seed fixtures, lifecycle/version/approval rules, repository, and schema.
2. Shared module shell, overview, planning, pipeline, inspector, creation and transitions.
3. Calendar, approvals, assets, publisher, community, listening, performance, and settings.
4. Tests, production build, database verification, browser/responsive verification, and regression fixes.

## Explicitly deferred by the approved Launch boundary

- Direct publishing connectors and unified social-message ingestion.
- Automated listening feeds, native media storage/transcoding/CDN, semantic media search.
- Advanced attribution, no-code automation builder, native mobile applications, and uncapped direct AI.
- Third-party capability replacement without a documented cost, migration, parallel-run, and rollback gate.
