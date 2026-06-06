# SPRINT.md — La Pupusería Alquimista

> **Project:** La Pupusería Alquimista — Interactive Market Sandbox  
> **Stack:** Vanilla JS · Anthropic JS SDK (`claude-sonnet-4-6`) · Local SQLite via MCP · Chart.js · Tailwind CSS  
> **Dataset:** Nvidia Nemotron El Salvador Synthetic Cohort Dataset  
> **Sprint Duration:** 14 days (2-week aggregate)  
> **Last Updated:** 2026-06-06

---

## PROJECT EPIC & GOAL DEFINITION

**Core Objective:**  
Ship a **single-file interactive market sandbox** (`index.html`) that cross-references creative pupusa recipes (Masa + Proteins + Toppings + Price) against synthetic Salvadoran consumer cohorts segmented by geographic region and socio-economic tier, using Claude as the reasoning engine and a local SQLite database as the authoritative data source.

**Success Looks Like:**
- A zero-build, zero-bundler client-side application that runs from a single HTML file in any modern browser.
- Claude returns structured JSON pricing insights and dialect-authentic regional consumer reactions.
- A live Chart.js bar chart aggregates regional sentiment scores in real time.
- Zero unhandled crashes on malformed or markdown-wrapped API responses.

---

## TIMELINE OVERVIEW — 2-WEEK AGGREGATE SPRINT MAPPING

| Phase | Days   | Focus Area                                    | Output                              |
|-------|--------|-----------------------------------------------|-------------------------------------|
| 1     | 1 – 3  | Data Infrastructure & MCP Pipeline            | `nemotron_el_salvador.db` + `mcp.json` |
| 2     | 4 – 7  | System Prompt Engineering & SDK Integration   | Prompt matrix + Claude pipeline     |
| 3     | 8 – 11 | Frontend UI Components & Charting             | `index.html` MVP + Chart.js         |
| 4     | 12–14  | Stress-Testing, Robustness & Hardening        | Hardened, production-ready sandbox  |

---

## DETAILED COMPONENT BACKLOG & TASK BREAKDOWN

---

### SPRINT 1 — Data & Brain Setup
**Focus:** Backend infrastructure, database, MCP pipeline, and system prompt architecture  
**Days:** 1–7

#### Epic 1.1 — SQLite Database Initialization

- [ ] **[DAY 1]** Create `nemotron_el_salvador.db` SQLite database file in the project root.
- [ ] **[DAY 1]** Define and run schema migrations for the core cohort table:
  - Columns: `cohort_id`, `region`, `income_tier`, `age_bracket`, `price_sensitivity_index`, `dialect_tags`, `food_preference_score`
  - Regions enum: `Central`, `Oriental`, `Occidental`, `Paracentral`
  - Income tiers enum: `low`, `middle`, `upper-middle`, `high`
- [ ] **[DAY 1]** Create composite index on `(region, income_tier)` for fast cohort slicing.
- [ ] **[DAY 1]** Create index on `income_tier` alone for standalone socio-economic queries.
- [ ] **[DAY 2]** Seed database with Nvidia Nemotron El Salvador synthetic cohort records.
- [ ] **[DAY 2]** Write and run a validation query confirming row counts per region are non-zero.
- [ ] **[DAY 2]** Document final schema in a `DB_SCHEMA.md` file at project root.

#### Epic 1.2 — MCP Pipeline Configuration

- [ ] **[DAY 2]** Create `mcp.json` configuration file at project root.
- [ ] **[DAY 2]** Configure MCP server entry to expose `nemotron_el_salvador.db` as a local SQLite datasource.
- [ ] **[DAY 3]** Define and expose the following MCP tools to the development agent runtime:
  - `query_cohorts(region, income_tier)` — returns filtered cohort slice as JSON array
  - `get_price_sensitivity(region)` — returns average `price_sensitivity_index` per region
  - `get_dialect_tags(region)` — returns array of Caliche/regional slang tags for prompt injection
- [ ] **[DAY 3]** Validate MCP tool connectivity with a manual test query via CLI.
- [ ] **[DAY 3]** Confirm MCP server can be started without global Node installation (document startup command).

#### Epic 1.3 — System Prompt Engineering

- [ ] **[DAY 4]** Draft the **base cultural system prompt** establishing Claude's persona as a Salvadoran market analyst.
- [ ] **[DAY 4]** Write the **Central region prompt module** — urban San Salvador consumer profile, middle-to-upper income sensitivity, formal/neutral dialect layer.
- [ ] **[DAY 5]** Write the **Oriental region prompt module** — eastern department profile (Usulután, San Miguel, La Unión, Morazán), rural/semi-rural income tiers, high price sensitivity, regional Caliche slang injection.
- [ ] **[DAY 5]** Write the **Occidental region prompt module** — Santa Ana and Sonsonante profiles, agri-economy income mix, moderate price sensitivity, local dialect markers.
- [ ] **[DAY 5]** Write the **Paracentral region prompt module** — La Paz, Cuscatlán, Cabañas, San Vicente profiles, mixed urban-rural, Caliche blend with Central influences.
- [ ] **[DAY 6]** Implement the **socio-economic pricing ratio logic** inside system instructions:
  - Define markup tolerance bands per income tier (e.g., `low: ±5%`, `middle: ±15%`, `upper-middle: ±25%`, `high: ±40%`).
  - Instruct Claude to evaluate submitted price against cohort's `price_sensitivity_index` and return an acceptance probability score (0.0–1.0).
- [ ] **[DAY 6]** Enforce strict **single-line JSON output formatting** in system instructions:
  - Explicitly prohibit markdown code fences (`` ``` ``), newlines inside JSON, and prose explanations in the response body.
  - Define exact required JSON schema: `{ "region": string, "cohort": string, "acceptance_score": float, "price_verdict": string, "dialect_reaction": string }`.
- [ ] **[DAY 7]** Test all four regional prompt modules individually against a fixture recipe payload.
- [ ] **[DAY 7]** Iterate prompt wording until dialect authenticity passes a manual review checklist.

---

### SPRINT 2 — Frontend & Core Pipeline
**Focus:** Single-file HTML scaffold, SDK integration, parallel API calls, response parsing, and visualization  
**Days:** 8–14

#### Epic 2.1 — HTML/UI Scaffold

- [ ] **[DAY 8]** Create `index.html` — the single-file application entry point.
- [ ] **[DAY 8]** Load Tailwind CSS from CDN in `<head>` (no build step required).
- [ ] **[DAY 8]** Build the **Recipe Configuration Panel** with the following input fields:
  - `Masa Type` — dropdown: `Arroz`, `Maíz`, `Mixta`
  - `Proteins` — multi-select checkboxes: `Chicharrón`, `Queso`, `Frijoles`, `Loroco`, `Pollo`, `Camarones`
  - `Toppings` — multi-select checkboxes: `Curtido`, `Crema`, `Salsa Roja`, `Salsa Verde`
  - `Price` — range slider (`$0.25` – `$5.00`, step `$0.25`) with live label display
- [ ] **[DAY 8]** Build the **Region Filter Panel** — four toggle buttons for `Central`, `Oriental`, `Occidental`, `Paracentral`.
- [ ] **[DAY 8]** Add a prominent `Analizar Mercado` CTA button that triggers the API pipeline.
- [ ] **[DAY 8]** Add a loading state indicator (spinner or pulsing text) visible during API calls.
- [ ] **[DAY 9]** Apply Tailwind utility classes for responsive layout (mobile-first, single-column on small screens, 2-column grid on `md+`).
- [ ] **[DAY 9]** Apply a Salvadoran market aesthetic: earthy tones (`amber`, `stone`, `green`), bold typography for region labels.

#### Epic 2.2 — Anthropic SDK Integration

- [ ] **[DAY 9]** Embed the `@anthropic-ai/sdk` browser-compatible build via CDN `<script>` tag (ESM import or UMD bundle).
- [ ] **[DAY 9]** Initialize the Anthropic client in a `<script type="module">` block:
  ```js
  const client = new Anthropic({ apiKey: CONFIG.ANTHROPIC_API_KEY, dangerouslyAllowBrowser: true });
  ```
- [ ] **[DAY 9]** Expose a `CONFIG` object at the top of the script for runtime API key injection (no hardcoded secrets).
- [ ] **[DAY 10]** Implement `callCohortAnalysis(region, recipePayload)` — a single async function that:
  - Selects the correct regional system prompt module.
  - Injects live cohort data from MCP (or a pre-fetched JSON fixture for frontend-only mode).
  - Calls `client.messages.create()` with `model: "claude-sonnet-4-6"`, `max_tokens: 256`.
  - Returns the raw response string.
- [ ] **[DAY 10]** Implement `runParallelCohortAnalysis(activeRegions, recipePayload)` using `Promise.all()`:
  ```js
  const results = await Promise.all(activeRegions.map(r => callCohortAnalysis(r, recipePayload)));
  ```
- [ ] **[DAY 10]** Handle `Promise.all()` rejection gracefully — wrap each inner call in `try/catch` and return a structured error object per region on failure.

#### Epic 2.3 — Response Sanitization & Parsing

- [ ] **[DAY 10]** Implement `sanitizeApiResponse(rawString)` function with the following Regex pipeline:
  - Strip leading/trailing markdown fences: `/^```(?:json)?\s*/` and `/\s*```$/`
  - Collapse internal newlines: `/\n/g` → `""`
  - Trim surrounding whitespace
- [ ] **[DAY 11]** Implement `parseWithFallback(sanitizedString)`:
  - Attempt `JSON.parse(sanitizedString)`.
  - On `SyntaxError`, log the raw string to console with a `[PARSE ERROR]` prefix and return a typed error sentinel: `{ error: true, raw: sanitizedString, region }`.
  - Never throw to the caller — the pipeline must remain resilient.
- [ ] **[DAY 11]** Write unit-style inline test fixtures (5 malformed response strings) and manually verify `sanitizeApiResponse` + `parseWithFallback` against each.

#### Epic 2.4 — Chart.js Visualization

- [ ] **[DAY 11]** Load Chart.js from CDN in `<head>`.
- [ ] **[DAY 11]** Add a `<canvas id="sentimentChart">` element in the results section.
- [ ] **[DAY 11]** Implement `renderSentimentChart(parsedResults)`:
  - Labels: active region names.
  - Dataset: `acceptance_score` values per region (0.0–1.0 mapped to 0–100%).
  - Chart type: `bar`.
  - Color scheme: distinct Tailwind-aligned colors per region bar.
- [ ] **[DAY 11]** Implement chart update logic — destroy and re-render chart on each new analysis run.

#### Epic 2.5 — Consumer Reaction Cards (Caliche Log Display)

- [ ] **[DAY 11]** Implement `renderReactionCards(parsedResults)`:
  - For each region result, generate an HTML card containing:
    - Region badge (color-coded)
    - `price_verdict` value (e.g., "Precio justo", "Muy caro bróder")
    - `dialect_reaction` string rendered verbatim (preserving authentic Caliche)
    - `acceptance_score` displayed as a percentage bar
  - For error sentinels (`{ error: true }`): render a distinct "error" card with the raw string for debugging.
- [ ] **[DAY 12]** Style cards with Tailwind — rounded corners, shadow, region-specific accent border color.
- [ ] **[DAY 12]** Ensure cards are injected into the DOM without `innerHTML` string interpolation on untrusted data (use `textContent` for all API-derived string values to prevent XSS).

---

## PHASE 4 — STRESS-TESTING, ROBUSTNESS & HARDENING
**Days:** 12–14

#### Epic 3.1 — Adversarial Response Testing

- [ ] **[DAY 12]** Manually trigger API calls and confirm JSON parse succeeds for each of the four regional prompts under normal conditions.
- [ ] **[DAY 12]** Inject deliberately malformed system prompt suffix to provoke markdown-wrapped responses; confirm `sanitizeApiResponse` strips them cleanly.
- [ ] **[DAY 12]** Test with an invalid API key — confirm the error card renders instead of crashing the app.
- [ ] **[DAY 12]** Test with all four regions active simultaneously — confirm `Promise.all()` completes and all four cards render.
- [ ] **[DAY 13]** Test with price slider at minimum (`$0.25`) and maximum (`$5.00`) extremes — confirm pricing logic doesn't produce out-of-range scores.
- [ ] **[DAY 13]** Test with zero proteins and zero toppings selected — confirm the recipe payload is still valid and Claude doesn't refuse.

#### Epic 3.2 — Dialect Authenticity Audit

- [ ] **[DAY 13]** Review all four regional `dialect_reaction` outputs for a fixed reference recipe.
- [ ] **[DAY 13]** Verify that Oriental region responses contain at least one recognized Caliche expression (e.g., "bróder", "chivo", "baboso", "guanaco").
- [ ] **[DAY 13]** Verify that Central region responses maintain a more formal/neutral register distinct from Oriental.
- [ ] **[DAY 13]** Confirm no region returns English phrases or generic non-regional Spanish.

#### Epic 3.3 — Final Hardening Checklist

- [ ] **[DAY 14]** Confirm zero Node.js / bundler dependency — `index.html` must open and run in Chrome/Firefox with no server (or a simple `python3 -m http.server` for CORS).
- [ ] **[DAY 14]** Confirm API key is never logged to console or rendered in the DOM.
- [ ] **[DAY 14]** Run the full pipeline 3 consecutive times and confirm zero unhandled JS exceptions in browser DevTools.
- [ ] **[DAY 14]** Confirm Chart.js renders correctly after multiple successive analysis runs (no zombie canvas instances).
- [ ] **[DAY 14]** Minify inline CSS/JS if `index.html` exceeds 500KB (optional, stretch goal).
- [ ] **[DAY 14]** Tag the commit as `v0.1.0-sandbox` and write a one-paragraph `README.md` with run instructions.

---

## DEFINITION OF DONE (DoD) & ACCEPTANCE CRITERIA

A feature or task is **Done** when ALL of the following are true:

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | `index.html` runs entirely client-side with no Node.js or bundler required | Open file directly in browser; check DevTools Network tab for any failed module imports |
| 2 | Zero unhandled `Promise` rejections or uncaught `SyntaxError` exceptions across all four regional analysis paths | Browser DevTools Console shows zero red errors after a full analysis run |
| 3 | All four regional system prompts return syntactically valid JSON without manual intervention | Automated inline fixture test passes; production run parsed cleanly on 3/3 attempts |
| 4 | `sanitizeApiResponse()` successfully strips markdown code fences, internal newlines, and excess whitespace from all known malformed response shapes | Manual adversarial test suite (5 fixtures) passes |
| 5 | `dialect_reaction` field contains authentic Salvadoran regional dialect — Caliche for Oriental, formal register for Central | Manual dialect review checklist signed off on reference recipe |
| 6 | Chart.js bar chart renders `acceptance_score` per active region after each analysis run, with no zombie canvas artifacts | Visual inspection after 3 consecutive analysis runs |
| 7 | Consumer reaction cards render `price_verdict` and `dialect_reaction` using `textContent` (no XSS vector via `innerHTML` on API data) | Code review confirms DOM injection method |
| 8 | API key is never exposed in rendered HTML, console logs, or network response bodies | DevTools Elements + Console + Network inspection |
| 9 | `Promise.all()` parallelization completes all active region calls before results are rendered | DevTools Network waterfall confirms overlapping request timing |
| 10 | SQLite MCP pipeline is documented and can be started with a single command listed in `README.md` | Fresh machine dry-run by a second team member |

---

## FILE STRUCTURE TARGET (End of Sprint)

```
claude_bootcamp/
├── index.html                    # Single-file application (Vanilla JS + Tailwind + Chart.js)
├── nemotron_el_salvador.db       # SQLite cohort database
├── mcp.json                      # MCP server configuration
├── DB_SCHEMA.md                  # Database schema documentation
├── CLAUDE.md                     # Project context for AI agents
├── SPRINT.md                     # This file
└── README.md                     # Run instructions (created Day 14)
```

---

## RISK LOG

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude returns markdown-wrapped JSON despite system prompt instructions | Medium | High | `sanitizeApiResponse()` Regex pipeline as mandatory pre-parse step |
| Browser CORS blocks SDK calls without a local server | Medium | High | Document `python3 -m http.server` startup; test both file:// and localhost origins |
| Caliche dialect prompts produce generic Spanish under high temperature | Low | Medium | Lock `temperature: 0.7` and seed dialect examples directly in system prompt |
| `Promise.all()` hangs if one region call times out | Low | High | Wrap each call in `Promise.race()` with a 15s timeout sentinel |
| SQLite MCP server unavailable in client runtime | Medium | Medium | Build JSON fixture fallback mode that bypasses MCP for frontend-only testing |

---

*Maintained by the La Pupusería Alquimista dev team. Update checkbox state daily. Raise blockers as GitHub Issues tagged `sprint-blocker`.*
