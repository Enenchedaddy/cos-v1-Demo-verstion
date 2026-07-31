# COS V1.2 — Control Ledger Design Standard

**Build-ready redesign specification · 25 Jul 2026**  
_Central Operating System · one governed view of commercial operations_

---

## 00. Design Thesis

COS is not a generic SaaS dashboard. It is a governed operating environment where executives and operators inspect evidence, make decisions, and leave an auditable trail.

The interface should feel like a **modern control ledger**:

- calm enough for long operational sessions;
- exact enough for finance and compliance;
- legible under high information density;
- visibly accountable whenever AI or automation is involved;
- recognisable as COS without relying on decorative effects.

The signature visual device is the **evidence rail**: a narrow, structured line of source, owner, timestamp, and status metadata attached to decisions, metrics, and recommendations. It replaces ornamental badges with useful provenance.

### The page’s single job

At every level, answer:

> What needs attention, what evidence supports it, and who can act?

If an element does not help answer that question, remove it.

---

## 01. Non-negotiable Principles

1. **Evidence before decoration.** Numbers, labels, and status markers must trace to real demo or production data.
2. **Hierarchy before cards.** Use spacing, rules, typography, and grouping before placing content in a container.
3. **One shell, adaptive compositions.** Navigation is consistent, but each workspace may arrange content around its actual task.
4. **Human authority is visible.** AI never appears to approve, pay, publish, or override policy.
5. **Dense does not mean cramped.** Operational screens can carry detail while retaining clear reading order.
6. **Mobile is a companion mode.** Mobile prioritises review, approval, alerts, and handoff rather than shrinking every desktop control.
7. **Every release is reviewed visually and interactively.**

### Hard bans

- No purple, violet, or indigo as a dominant brand or AI colour.
- No purple-to-blue or purple-to-pink gradients.
- No gradient-filled headline text.
- No glassmorphism, frosted cards, glow effects, or decorative blur.
- No generic centred hero with two buttons and a stat row.
- No giant unsourced metrics.
- No emoji in headings, navigation, or statuses.
- No “Why choose COS?”, “Transform your business”, or interchangeable SaaS copy.
- No pill-badge clutter.
- No shadow on every card.
- No animation that exists only to make the interface feel active.

---

## 02. Brand Expression

### Brand character

**Measured · forensic · decisive · composed**

COS should look like a system trusted with consequential decisions, not a promotional technology demo.

### Logo rules

- Wording remains **Central Operating System**.
- Preserve the existing hexagonal mark geometry.
- Full-colour lockup: gateway, formal covers, and design-system documentation.
- White lockup: dark navigation rail only.
- Monochrome ink mark: print, exports, favicons, and restrained footer use.
- Minimum standalone mark: `24px`.
- Minimum lockup width: `96px`.
- Clear space: one facet height on every side.
- Never stretch, rotate, outline, shadow, recolour ad hoc, or place over busy imagery.

### Signature composition

Use the six-facet geometry as a structural cue, not a repeated illustration:

- six-column subdivisions on wide executive views;
- clipped or stepped rule endings;
- facet-shaped data markers only where they encode state;
- one large cropped mark may appear on the gateway, at very low contrast.

Do not scatter hexagons across cards or backgrounds.

---

## 03. Colour System

The redesign retains the recognisable COS navy while replacing framework-blue dominance with a warmer, more editorial control-room palette.

### Core palette

| Token | Hex | Role |
| :-- | :-- | :-- |
| `ink` | `#15202B` | Primary text, dark controls, chart anchors |
| `cos-navy` | `#183153` | Navigation rail, formal brand surfaces |
| `paper` | `#FCFBF7` | Primary canvas; warmer than default white |
| `panel` | `#FFFFFF` | Tables, forms, overlays, focused work surfaces |
| `rule` | `#D8D6CE` | Dividers, table rules, input boundaries |
| `signal` | `#C84F2A` | Primary action, focus emphasis, selected evidence |

### Supporting functional colours

| Token | Hex | Role |
| :-- | :-- | :-- |
| `muted` | `#5E6872` | Secondary copy and metadata |
| `navy-soft` | `#DDE6EF` | Selected navigation and informational tint |
| `signal-soft` | `#F7E7DF` | AI/recommendation and attention tint |
| `success` | `#246B4A` | Verified, healthy, complete |
| `success-soft` | `#E4F0E9` | Success background |
| `warning` | `#8A5A12` | At risk, approaching threshold |
| `warning-soft` | `#F5ECD8` | Warning background |
| `danger` | `#A63A32` | Breach, destructive action, blocked state |
| `danger-soft` | `#F6E3E1` | Danger background |

### Usage rules

- `paper` should occupy most of the viewport.
- `cos-navy` anchors navigation and formal identity, not every heading.
- `signal` is the single brand accent. Reserve it for primary actions, active markers, and AI provenance.
- Semantic colours communicate state only; they do not identify whole workspaces.
- Workspace identity comes from labels, content, and composition—not a different rainbow colour per module.
- Charts use ink, navy, signal, and neutral tints first. Add semantic colours only when the data itself represents status.
- No gradients.

### Contrast gate

Before implementation, verify every text/background pair with an automated contrast checker:

- body text: minimum `4.5:1`;
- large text and essential graphical objects: minimum `3:1`;
- focus indicators: minimum `3:1` against adjacent colours.

Do not publish claimed ratios in the UI. Keep evidence in release documentation.

---

## 04. Typography

Typography distinguishes executive interpretation, operational work, and machine evidence.

### Family contract

- **Display and editorial headings:** `Newsreader`, serif; fallback `Georgia, serif`.
- **Interface and body:** `IBM Plex Sans`; fallback `Arial, sans-serif`.
- **Evidence and tabular data:** `IBM Plex Mono`; fallback `Consolas, monospace`.

Load only required weights, use `font-display: swap`, and self-host for production where possible.

### Type scale

| Token | Family | Mobile | Desktop | Weight | Use |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `display` | Newsreader | `40/42` | `64/64` | `600` | Gateway thesis and formal covers |
| `h1` | Newsreader | `32/36` | `44/48` | `600` | Workspace title |
| `h2` | Newsreader | `25/30` | `32/36` | `600` | Major section title |
| `h3` | IBM Plex Sans | `18/24` | `20/26` | `600` | Panel and decision title |
| `body-lg` | IBM Plex Sans | `16/25` | `17/27` | `400` | Introductions and important explanations |
| `body` | IBM Plex Sans | `14/22` | `14/22` | `400` | General interface copy |
| `small` | IBM Plex Sans | `12/18` | `12/18` | `400` | Supporting metadata |
| `label` | IBM Plex Sans | `11/16` | `11/16` | `600` | Navigation groups and field labels |
| `table` | IBM Plex Sans | `13/18` | `13/18` | `400` | Data-grid content |
| `metric` | IBM Plex Mono | `26/30` | `32/36` | `500` | Verified KPI values |
| `evidence` | IBM Plex Mono | `11/16` | `11/16` | `400` | IDs, timestamps, sources, model metadata |

### Typesetting rules

- Headings use sentence case, never all caps.
- Labels may use uppercase with `0.06em` tracking; keep them short.
- Use tabular numerals for currency, percentages, timestamps, and comparable quantities.
- Use UK date format: `16 Jul 2026 · 08:30 BST`.
- Use `£1,284,600` in detail views and `£1.28m` only where width is constrained.
- Missing values display as `—`.
- Restricted values display as `•••• Restricted`.
- Keep paragraph measures between `55–75ch`.
- Avoid ultra-bold weights as a substitute for hierarchy.

---

## 05. Layout and Rhythm

### Spacing tokens

Use a 4px base with an 8px working rhythm:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

### Shell dimensions

- Expanded navigation rail: `248px`.
- Collapsed desktop rail: `72px`.
- Top utility bar: `64px`.
- Reading/content maximum: `1520px`.
- Evidence or context drawer: `360–440px`.
- Standard table row: `44px`.
- Compact table row: `36px`.
- Touch target: minimum `44×44px`.

### Desktop grid

Use a 12-column fluid grid with:

- `24px` gutters at `1024px`;
- `32px` gutters from `1280px`;
- `32–48px` outer margins;
- content aligned to shared vertical rules.

Prefer asymmetric arrangements such as `7/5`, `8/4`, or `9/3`. Do not force every screen into equal cards.

### Surface hierarchy

1. **Canvas:** warm paper background.
2. **Work surface:** white table, form, or decision panel with a `1px` rule.
3. **Raised surface:** modal, command palette, or temporary overlay only.

Use shadows only for raised surfaces:

`0 12px 32px rgba(21, 32, 43, 0.14)`

### Radius rules

- inputs and compact controls: `4px`;
- buttons and work panels: `6px`;
- large overlays: `8px`;
- tables, rails, and full-width sections: `0px`.

Avoid excessive rounded containers and nested cards.

---

## 06. Core Shell

### Navigation rail

- Dark `cos-navy` surface with white primary labels.
- Group items by real operational domain.
- Active state uses a solid `3px signal` rule and `navy-soft` text—not a glowing tile.
- Show a clear collapsed state at desktop widths.
- On mobile, open as an accessible modal drawer with focus trap, Escape support, and labelled close control.

### Top utility bar

The bar contains only:

- current workspace and business-unit scope;
- global search/command access;
- data freshness;
- notifications;
- user and role menu.

Do not repeat the full logo lockup when the rail already displays it.

### Page header

Use an asymmetric two-zone header:

- left: eyebrow, page title, one-sentence operational purpose;
- right: owner, reporting period, last refresh, and one primary action.

Do not place decorative status pills beneath the title.

### Evidence rail

Attach the evidence rail to consequential content:

`SOURCE · OWNER · AS OF · POLICY/STATE`

Example:

`CRM + ERP · Finance Ops · 25 Jul 2026 09:40 BST · CO-10 VERIFIED`

Render it as a slim ruled row using the evidence typeface. On mobile it wraps into two rows without horizontal scrolling.

---

## 07. Gateway Redesign

The gateway should feel like the entrance to an operating institution, not a pricing page.

### Desktop composition

- Left `7/12`: COS mark, “Central Operating System,” and the thesis:
  **One governed view of the business.**
- Below: plain copy explaining that access, actions, and recommendations are recorded.
- Right `5/12`: a structured workspace index, not three floating feature cards.
- Each workspace row shows name, purpose, authorised role, and a direct `Enter workspace` action.
- A narrow bottom evidence strip shows identity provider, policy, session, and audit status.

### Workspace index order

1. Management — decisions, approvals, group performance.
2. Sales — accounts, pipeline, quotes, commercial controls.
3. Marketing — campaigns, consent, attribution, recommendations.
4. Design System — tokens, components, states, and release evidence.

Do not colour-code the four workspaces with unrelated hues. Use one accent and distinct Lucide icons.

### Mobile composition

- Brand and thesis first.
- Identity/scope selector second.
- Workspace rows become a simple divided list.
- The action spans the available width.
- Remove nonessential gateway explanation after the first visit if product state supports it.

---

## 08. Workspace Composition

### Management: decision desk

Prioritise:

1. items requiring executive action;
2. exceptions and breaches;
3. verified performance context;
4. recent decisions and their effects.

Use a dominant decision queue with a narrower context column. Avoid opening with a uniform KPI-card row. A metric appears large only when it changes the next decision.

### Sales: commercial ledger

Use:

- a compact account/pipeline table as the primary surface;
- a persistent quote-margin and approval context area;
- stage progression that communicates requirements, not just colour;
- provenance for price, discount, and margin calculations.

### Marketing: governed campaign room

Use:

- timeline or calendar as the main composition where scheduling is central;
- consent and audience eligibility beside publishing controls;
- performance evidence below, not as decorative hero stats;
- AI suggestions labelled and visually subordinate to human actions.

### Design System: working specification

Present tokens and components as a documentation workspace:

- chapter navigation;
- live examples beside concise rules;
- copyable token values;
- state and accessibility matrices;
- release checklist with actual pass/fail evidence.

Avoid a dark “developer console” theme unless displaying literal logs or code.

---

## 09. Components

Retain existing component IDs for traceability. Redesign their visual treatment under this standard.

### Buttons — `C-BTN-01…06`

- Primary: `signal` fill, white label.
- Secondary: `panel` fill, `ink` label, `rule` border.
- Quiet: text-only with underline or arrow on hover.
- Destructive: `danger` fill or outlined confirmation treatment.
- Use verb-led labels: `Approve quote`, `Open evidence`, `Return to owner`.
- Never use shadow as the primary affordance.

### Inputs — `C-INP-01…04`

- Labels remain visible above fields.
- Focus uses a `2px signal` outline with offset.
- Help and error text reserve layout space.
- Do not use placeholder text as the label.

### Tables — `C-TBL-01…05`

- Prefer horizontal rules to boxed cells.
- Sticky headers are allowed when row count requires them.
- Align numbers right and labels left.
- Keep row actions discoverable through a labelled menu.
- Provide sort direction in text for assistive technology.
- On mobile, switch to a prioritised record view rather than forcing horizontal scroll.

### Status markers

- Pair colour with an icon or text label.
- Use compact rectangular labels, not a cloud of pills.
- Show status only where it changes interpretation or action.

### Charts — `C-CHT-01…11`

- Every chart has a specific question in its title.
- Include units, reporting period, source, and last refresh.
- Direct-label important series where space allows.
- Avoid legends with more than six items.
- Provide a table alternative for complex data.
- Never use 3D effects, gradients, or decorative animation.

### Overlays — `C-OVR-01…06`

- Use a drawer for evidence, history, or record detail.
- Use a modal for one bounded decision.
- Use a full page for multi-step or high-risk work.
- Return focus to the invoking control on close.

### State views — `C-STA-01…05`

Empty, loading, error, and restricted states must explain:

- what happened;
- whether data is safe;
- what the user can do next;
- who owns resolution where relevant.

---

## 10. AI and Governance

AI is identified by **language, provenance, and the `signal` accent**, not purple styling or sparkle icons.

### Surface classes

1. `AUTO` — deterministic policy execution; immutable audit record.
2. `DRAFT` — editable material; not transmitted without review.
3. `RECOMMEND` — suggestion requiring human action and evidence.
4. `GATED` — blocked pending required approval, MFA, or signature.
5. `BLOCKED` — action constitutionally unavailable to AI.

### Recommendation anatomy — `C-AI-01…06`

Every recommendation includes:

- class and confidence stated in plain text;
- one-sentence recommendation;
- expected operational effect;
- sources and freshness;
- reasoning summary;
- model and prompt identifiers;
- `Accept`, `Edit`, and `Reject` where permitted;
- named human owner for the resulting action.

Do not animate an AI badge. Do not use sparkle icons as the default AI symbol.

### “Why” panel

The panel must separate:

1. **Evidence used**
2. **Interpretation**
3. **Policy constraints**
4. **Uncertainty**
5. **Available human actions**

### Kill switch

- Present as a flat, red-ruled governance panel.
- Require a two-second hold plus a typed explanation.
- Announce progress accessibly.
- Record administrator, scope, reason, timestamp, and result.
- Never rely on colour or animation alone.

---

## 11. Iconography and Imagery

### Icons

- Lucide only.
- Stroke width: `1.75px`.
- Sizes: `16`, `20`, `24`, or `32px`; `12px` only in dense evidence metadata.
- Use one icon per action or concept when it improves scanning.
- Do not place every icon inside a coloured rounded square.
- Accessible names belong on icon-only controls.

### Imagery

The product should not depend on stock photography. If imagery is introduced:

- use documentary industrial or operational material tied to the represented business unit;
- avoid abstract 3D blobs, floating UI renders, generic office teams, and neon AI imagery;
- use one strong image rather than a decorative gallery;
- provide meaningful alt text or empty alt text for purely decorative images.

---

## 12. Motion

Motion communicates state change only.

- One short gateway entrance sequence may reveal the thesis and workspace index.
- Drawers use a restrained `180–220ms` transition.
- Hover motion is limited to colour, underline, or a `2px` directional shift.
- Loading indicators communicate actual loading.
- No pulsing compliance dots, floating cards, or perpetual sparkle animation.
- Respect `prefers-reduced-motion`; remove nonessential transitions entirely when enabled.

---

## 13. Responsive Behaviour

Design mobile-first and verify at:

- `375px`
- `768px`
- `1024px`
- `1440px`

### Breakpoint intent

- `<768px`: companion mode; alerts, review, approve, search, and handoff.
- `768–1023px`: compact workspace; drawer navigation and single primary column.
- `1024–1279px`: full shell with reduced context width.
- `≥1280px`: 12-column composition and persistent evidence/context panels.

### Required checks

- no horizontal page scroll;
- no clipped labels or controls;
- no overlapping drawers, menus, or sticky regions;
- minimum `44×44px` touch targets;
- mobile menu opens, traps focus, closes, and restores focus;
- complex tables have prioritised mobile alternatives;
- charts preserve readable labels and data access;
- type and spacing scale intentionally rather than merely shrinking.

---

## 14. Accessibility and Content

### Accessibility floor

- semantic landmarks and heading order;
- visible `:focus-visible` treatment;
- keyboard access to all actions;
- labelled controls and programmatic errors;
- alt text for meaningful images;
- text alternatives for charts;
- colour-independent status communication;
- reduced-motion support;
- WCAG AA contrast;
- live-region announcements for asynchronous approval, save, and error states.

### Voice

Write like an accountable operator:

- specific;
- calm;
- direct;
- free of hype.

Prefer:

- `3 quotes require margin approval`
- `Source data last refreshed 18 minutes ago`
- `This recommendation cannot issue payment`

Avoid:

- `Unlock powerful insights`
- `Supercharge your workflow`
- `Seamless AI-driven transformation`
- `Everything you need, all in one place`

---

## 15. Canonical Demo Dataset

Only show these figures when the screen’s task genuinely calls for them:

- MTD revenue: `£1,284,600` (`+7.4%`)
- Pipeline value: `£3,842,000`
- Weighted pipeline: `£2,116,000`
- Forecast revenue: `£1,476,000` (`+7.4%`)
- Available cash: `£2,340,000`
- Open approvals: `14`
- ROAS: `4.2x`
- Open tickets: `38`

Pipeline distribution:

`640k + 520k + 455k + 430k + 390k + 360k + 335k + 280k + 230k + 202k`

Business units:

1. Electronics
2. Industrial Gases
3. Manufacturing
4. Imports
5. Agency

Accounts:

1. Northwind Industrial
2. Calder Gas Services
3. Harborline Retail
4. Pentland Components
5. Ashford Mobility
6. Beacon Homeware
7. Rivermere Engineering
8. Solent Distribution
9. Tynebridge Foods
10. Meriden Medical

Users:

- `OR` Olivia Reed · Group CEO
- `MH` Marcus Hale · Sales Manager
- `PS` Priya Shah · Account Executive
- `TB` Tom Briggs · Account Executive
- `AB` Aisha Bello · Marketing Lead
- `DK` Daniel Kerr · Marketing Ops
- `CE` Clara Evans · Finance Director
- `HS` Helen Shaw · Support Lead
- `PC` Peter Cole · Operations Lead
- `EM` Erin Moore · Platform Admin
- `IK` Idris Khan · Data Analyst
- `SG` Sophie Grant · Legal & Compliance

---

## 16. Release Review

Before calling a redesign complete:

1. Build and type-check the project.
2. Preview the gateway and each workspace at all four target widths.
3. Capture desktop and mobile screenshots.
4. Exercise navigation, menus, search, forms, approvals, drawers, and destructive confirmations.
5. Verify keyboard order, focus return, labels, errors, and reduced motion.
6. Check data provenance and canonical figures.
7. Read every prominent sentence and remove generic SaaS language.
8. Run the checklist below.
9. Remove one visual element that is not earning its place.
10. Record failures fixed during the review.

### Vibe-code checklist — every answer must be “No”

- [ ] Is purple, violet, or indigo visually dominant?
- [ ] Is any purple/blue/pink gradient present?
- [ ] Is headline text gradient-filled?
- [ ] Are unsourced giant stats used as decoration?
- [ ] Are emoji used in headings or statuses?
- [ ] Is there a generic “Why choose us?” or transformation slogan?
- [ ] Is the page one centred column of interchangeable sections?
- [ ] Does typography rely only on Inter or system fonts?
- [ ] Are frosted glass, glow, or blur used decoratively?
- [ ] Are shadows applied to most cards?
- [ ] Are there too many rounded containers or badges?
- [ ] Does motion continue without communicating state?
- [ ] Does mobile look like a compressed desktop screen?

---

## 17. Implementation Order

1. Tokenise the new palette, typography, spacing, radii, and elevation.
2. Rebuild the shell and responsive navigation.
3. Redesign the gateway as the asymmetric workspace index.
4. Establish the evidence rail and recommendation anatomy.
5. Update buttons, fields, tables, status markers, overlays, and state views.
6. Recompose Management around decisions and exceptions.
7. Recompose Sales around the commercial ledger.
8. Recompose Marketing around campaign governance.
9. Recompose the Design System as working documentation.
10. Complete the release review and record evidence.

This document defines the target state. Existing implementation details do not override it unless required for security, data integrity, or an explicit product constraint.
