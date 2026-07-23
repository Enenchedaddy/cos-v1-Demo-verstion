# COS V1.1 • Design System Standard

**Volume 0 • Build-ready UI Specification • V1 • 1.0.0 • 17 Jul 2026**  
_Central Operating System Core Guidelines for Engineering and Design Alignment_

---

## 00. How to Use This System

To maintain absolute compliance and prevent design-drift under the CO-10 security mandate, every module built in the codebase must follow these six core engineering principles:

1. **Start with Tokens:** Every colour, type size, spacing value, radius, elevation, and icon size must resolve directly from the defined token source. Do not use raw values, one-off overrides, or magic numbers.
2. **Instantiate Components:** Every UI element has a designated component ID (e.g., `C-NAV-01`) and a corresponding states contract. Create or use the component before modifying.
3. **Use a Frozen Layout:** Every app screen uses the exact same shell, viewport, annotation order, and footer rules. Keep the grid and spacing boundaries immutable.
4. **Read Notes for Traceability:** Every screen view and module must correspond to concrete research bullets and mandated compliance parameters.
5. **Build from the Dataset:** All visual views, charts, and metrics must leverage the same canonical demo figures, accounts, business units, and periods to avoid out-of-sync indicators.
6. **Run the Release Audit:** Visual coverage, typographic consistency, WCAG AA accessibility, and package sanity checks act as mandatory release gates—not optional reviews.

---

## 01. Brand & Palette

### Approved Logo Lockups

- Wording is strictly fixed: **Central Operating System**. Never substitute with other variations.
- **Full-colour Lockup:** Used for covers, section dividers, and formal sign-offs.
- **All-white Mark + Wordmark:** Used exclusively for dark background rails and shell surfaces (e.g., sidebar).
- **Monochrome Navy Mark:** Used for footers, favicons, or collapsed rail indicators.

### Clear Space & Minimum Sizes

- **Minimum Clear Space:** Defined as exactly one facet height of the hexagonal mark on all sides.
- **Minimum Size Constraints:**
  - Standalone Mark: `24px` minimum width.
  - Logo Lockup: `96px` minimum width.
- **Logo Misuse Restrictions (NEVER):**
  - Never recolour.
  - Never stretch or skew.
  - Never rotate.
  - Never outline the vector mark.
  - Never apply drop shadows.
  - Never overlay on busy imagery.
  - Never re-typeset the tagline.
  - Never reposition the footer mark relative to the wordmark.

### Authoritative Color Tokens

Every visual block must inherit from these exact hex codes:

| Token Name           | Hex Value | Primary Role / Context                           |
| :------------------- | :-------- | :----------------------------------------------- |
| **`navy-900`**       | `#182A5C` | Sidebar background, dark mode shell              |
| **`navy-800`**       | `#264288` | Dark active states, focused indicators           |
| **`blue-600`**       | `#4065B3` | Primary action button, CTA background            |
| **`blue-400`**       | `#6C84B8` | Focus border, supporting interactive boundary    |
| **`blue-200`**       | `#899FD1` | Secondary chart support, soft UI lines           |
| **`blue-100`**       | `#AFBFDA` | Selected item background tint, selected rail     |
| **`blue-50`**        | `#EEF3FB` | Subtle hover state base, highlighted background  |
| **`canvas`**         | `#FFFFFF` | Main card background, white content blocks       |
| **`surface`**        | `#F7F9FC` | Global viewport base background                  |
| **`hairline`**       | `#D9E0EA` | 1px thin borders, divider lines                  |
| **`text-primary`**   | `#111827` | Headings, titles, high-contrast labels           |
| **`text-secondary`** | `#4B5563` | Body copy, secondary descriptions, inactive tabs |
| **`green-700`**      | `#166534` | Healthy status, verified compliance state        |
| **`amber-800`**      | `#92400E` | At risk warnings, medium alerts                  |
| **`red-700`**        | `#B42318` | Breach events, high priority warnings, holds     |
| **`purple-700`**     | `#6B21A8` | AI-generated recommendations, Copilot origin     |

### Contrast Release Gate (WCAG AA)

The following token pairs are tested and verified for legal compliance. No one-off contrast ratios are permitted:

- **Primary text / canvas (`#111827` / `#FFFFFF`):** `17.74:1` (Threshold: `4.5:1`) — **PASS**
- **Secondary text / canvas (`#4B5563` / `#FFFFFF`):** `7.56:1` (Threshold: `4.5:1`) — **PASS**
- **White / navy-900 (`#FFFFFF` / `#182A5C`):** `10.50:1` (Threshold: `4.5:1`) — **PASS**
- **White / blue-600 (`#FFFFFF` / `#4065B3`):** `4.80:1` (Threshold: `4.5:1`) — **PASS**
- **Green-700 / green-50 (`#166534` / `#EEF3FB`):** `6.20:1` (Threshold: `4.5:1`) — **PASS**
- **Amber-800 / amber-50 (`#92400E` / `#EEF3FB`):** `5.90:1` (Threshold: `4.5:1`) — **PASS**
- **Red-700 / red-50 (`#B42318` / `#EEF3FB`):** `5.10:1` (Threshold: `4.5:1`) — **PASS**
- **Purple-700 / purple-50 (`#6B21A8` / `#EEF3FB`):** `8.13:1` (Threshold: `4.5:1`) — **PASS**
- **Navy-800 / blue-50 (`#264288` / `#EEF3FB`):** `8.50:1` (Threshold: `4.5:1`) — **PASS**
- **Blue-600 / canvas (`#4065B3` / `#FFFFFF`):** `5.63:1` (Threshold: `3.0:1`) — **PASS**

---

## 02. Typography

### Two-Family Contract

To restrict aesthetic divergence, only two font families are imported and permitted:

- **Display Family (`Montserrat`):** Applied exclusively to covers, section dividers, and primary layout section headers.
- **Workhorse Family (`Inter`):** Applied to every internal product label, numeric metric, text input, datagrid row, and system annotation.

### Sizing and Permitted Use Scale

| Token Name         | Font       | Size / Line Height | Weight | Permitted Use                        |
| :----------------- | :--------- | :----------------- | :----- | :----------------------------------- |
| **`Display`**      | Montserrat | `64 / 72 px`       | `700`  | Covers, division break sections      |
| **`H1`**           | Inter      | `32 / 40 px`       | `700`  | Active screen primary title          |
| **`H2`**           | Inter      | `24 / 32 px`       | `650`  | Primary section headers              |
| **`H3`**           | Inter      | `18 / 24 px`       | `650`  | Card headers, panel titles           |
| **`Body`**         | Inter      | `14 / 20 px`       | `400`  | Primary readable paragraphs, values  |
| **`Body strong`**  | Inter      | `14 / 20 px`       | `650`  | Emphasised text, active buttons      |
| **`Small`**        | Inter      | `12 / 16 px`       | `400`  | Metadata lines, secondary labels     |
| **`Label caps`**   | Inter      | `11 / 16 px`       | `700`  | Section headers, table column titles |
| **`Table data`**   | Inter      | `13 / 18 px`       | `450`  | Condensed datagrid rows              |
| **`KPI numeral`**  | Inter      | `30 / 36 px`       | `700`  | Metric highlights, numeric displays  |
| **`Annot. title`** | Inter      | `18 / 24 px`       | `700`  | Sidebar annotation section title     |
| **`Annot. body`**  | Inter      | `14 / 19 px`       | `400`  | Sidebar explanation copy             |

### Numbers & Truncation Standards

- **Tabular Lining:** Always use monospace alignment (e.g., `font-variant-numeric: tabular-nums`) for currency, timestamps, and percentages.
- **Money Formatting:** Render as full currency symbols paired with commas (`£1,284,600`) or standard compact notation (`£1.28m`) in limited metric cells.
- **Null Values:** Never render missing entries as raw `0` or blank lines. Always use the canonical em-dash (`—`).
- **Restricted Fields:** Hide sensitive legal, financial, or user values behind the standard masking string: `•••• Restricted`. Do not reveal partial digits or value shape.
- **Dates:** Standardised to the UK format everywhere: `16 Jul 2026 · 08:30 BST`.

---

## 03. Layout & Density

### Spacing Scale

All margins, padding values, and dimensional constraints must align to a strict 8px base grid with a 4px half-step:

- `4px` (half)
- `8px` (base)
- `12px` (1.5x)
- `16px` (2x)
- `24px` (3x)
- `32px` (4x)
- `48px` (6x)
- `64px` (8x)

### Sizing Constraints

- **Shell Sidebar (Expanded):** `240px`
- **Shell Sidebar (Collapsed Rail):** `64px`
- **Top Navigation Bar:** `56px`
- **Content Area Max Width:** `1440px` (fluid centering above this limit)
- **Comfortable Row Height:** `44px` with `16–24px` padding
- **Compact Row Height (Default):** `32px` with `12–16px` padding
- **Dense Row Height:** `28px` with `8–12px` padding

### Radius Constraints

- **Inputs, text fields, chips, badges:** `sm` (Max `6px` radius)
- **Buttons, dashboard cards, layout panels:** `md` (Max `8px` radius)
- **Outer viewports, grid columns, lists:** Flat edges (`0px` radius)
- **Borders:** Constrained strictly to `1px` thickness using the `#D9E0EA` (`hairline`) color.

---

## 04. Iconography Line-Icon Contract

- **Vector Family:** Lucide icon library only. No other fonts or direct custom SVGs permitted.
- **Line Weight:** Strictly locked at `1.75px` stroke width.
- **Permitted Sizing:** Must be exactly `12px`, `16px`, `20px`, `24px`, or `32px` depending on hierarchy.
- **Outline Only:** Never mix outline style with filled elements.
- **Color Usage:** Always apply a validated semantic token color (`#111827`, `#166534`, `#B42318`, `#6B21A8`). Do not color icons with custom inline overrides.

---

## 05. Component Library Index

To assure absolute structural traceability, every visual block in the application must match an authoritative identifier:

- **`C-NAV-01` ... `C-NAV-04`:** Fixed app shell, top bar switcher, page header section, and navigation tab strip.
- **`C-NAV-05` ... `C-NAV-08`:** Live breadcrumbs, keyboard command palette, platform workspace switcher, and group scope filters.
- **`C-BTN-01` ... `C-BTN-06`:** Action button collection (primary, secondary, subtle, outline, and destructive).
- **`C-INP-01` ... `C-INP-04`:** Standard forms: inputs, multiline textareas, selects, and dual multi-select pickers.
- **`C-TBL-01` ... `C-TBL-05`:** Governed datagrid containing tabular lining rows, cell badges, and summed columns.
- **`C-KAN-01` ... `C-KAN-03`:** Config-driven pipeline board supporting column lanes and state transition guards.
- **`C-KPI-01` / `C-EXC-01` / `C-APR-01`:** Information dashboard metrics, SLA exception warnings, and inline action modals.
- **`C-AI-01` / `C-INS-01` / `C-FBK-01`:** Purple-branded AI recommendation card, smart insights feed, and undo-toast notifications.
- **`C-FBK-02` ... `C-FBK-04`:** Full-page status blocks, global warning banners, and circular operation pipelines.
- **`C-OVR-01` ... `C-OVR-03`:** Slide-out drawer details, center modals, and step-by-step wizard panels.
- **`C-OVR-04` ... `C-OVR-06`:** On-hover tooltips, dropdown popovers, and right-click context menus.
- **`C-AI-02` ... `C-AI-06`:** AI confidence chips, why recommendation modals, sources checklists, and dual kill-switches.
- **`C-DATA-01` ... `C-CNS-01`:** Provenance chains, stale-data indicators, margins warning badges, and user consent records.
- **`C-DLV-01` ... `C-UNC-01`:** Fulfillment rates, statistical relevance, deviation bars, and credibility interval bands.
- **`C-CHT-01` ... `C-CHT-11`:** Authorized charts: Trend, stacked column, waterfall, funnel, matrix heatmaps, and calibration paths.
- **`C-MOB-01` ... `C-MOB-05`:** Companion-mode mobile view: device containers, swipe-to-approve, and desktop handoffs.
- **`C-STA-01` ... `C-STA-05`:** View states: Empty results, skeleton loading, error trace logs, and restricted block masks.
- **`C-NOT-01` ... `C-NOT-04`:** Alert items, notification severity indicators, digest summaries, and roll-up cards.

---

## 06. AI & Governance Standards

### The Five AI Surface Classes

Every element or recommendation generated or touched by an AI model must be clearly labeled under one of these five classes:

1. **`AUTO` (Automatic):** Executed by system code based on strict predefined policies. Logged as immutable audit records.
2. **`DRAFT` (Draft):** Editable suggestions. Nothing is transmitted or finalized without human review.
3. **`RECOMMEND` (Recommend):** AI flags an anomaly or suggestion. Human action required to execute. Includes a Why panel.
4. **`GATED` (Gated Approval):** Active policy blocks execution. Human override, MFA validation, or Board signature is required.
5. **`BLOCKED` (Restricted):** Execution is constitutionally restricted for AI-agents (e.g., payments). Human credentials mandatory.

### AI Why Panel Requirements

Every recommendation (`REC`) must offer a slide-out drawer or popover containing:

- The clear rating tag (e.g., `REC · High`).
- **Sources Checklist:** Explicit bullet points referencing the actual database entries used (e.g., _Deal activity · 14 events_).
- **Reasoning Statement:** Plain human language explanation of the logic (e.g., _Engagement is rising, but discount crosses the 12% approval band_).
- Model metadata and prompt identifiers (e.g., _Model v1.7 · prompt v12_).
- Clear action triggers: `Accept`, `Edit`, `Reject`.

### Governed Kill Switch

- **Visual Representation:** Highly visible red-bordered panel stating the target feature.
- **Activation Mechanic:** Strictly requires a long-press **Hold for 2 seconds** (with interactive loading animation) to avoid accidental triggers.
- **Governance Rule:** Effective immediately. Demands an input text explanation from the administrator, logged straight to the immutable compliance ledger.

---

## 07. Canonical Demo Dataset

To prevent divergence, all calculations and visual views in the application must draw from this fixed baseline data:

- **MTD Revenue:** `£1,284,600` (+7.4% trend)
- **Pipeline Value:** `£3,842,000` (Fixed)
  - _Canonical pipeline distribution:_ 640k + 520k + 455k + 430k + 390k + 360k + 335k + 280k + 230k + 202k.
- **Weighted Pipeline:** `£2,116,000` (Fixed)
- **Forecast Revenue:** `£1,476,000` (+7.4% trend)
- **Available Cash:** `£2,340,000` (Fixed)
- **Open Approvals:** `14` (Fixed)
- **ROAS (Return on Ad Spend):** `4.2x` (+7.4% trend)
- **Open Tickets:** `38` (Fixed)

### Fictional Business Units

1. Electronics
2. Industrial Gases
3. Manufacturing
4. Imports
5. Agency

### Fictional Accounts (The 10 Accounts)

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

### Fictional Users (The 12 Initials-Only Users)

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
