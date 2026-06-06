# 🫓 La Pupusería Alquimista

> **Geographic & Economic Market-Intelligence Sandbox for Experimental Salvadoran Gastronomy.**

[![Stack](https://img.shields.io/badge/stack-HTML5%20%7C%20Vanilla%20JS%20%7C%20Tailwind%20%7C%20Chart.js-blue?style=flat-square)](.)
[![Model](https://img.shields.io/badge/model-claude--sonnet--4--6-orange?style=flat-square)](.)
[![Dataset](https://img.shields.io/badge/dataset-nvidia%2FNemotron--Personas--El--Salvador-green?style=flat-square)](.)
[![Delivery](https://img.shields.io/badge/delivery-single--file%20%7C%20zero--build-purple?style=flat-square)](.)
[![License](https://img.shields.io/badge/license-MIT-gray?style=flat-square)](LICENSE)

---

## Overview

**La Pupusería Alquimista** is an AI-powered market intelligence sandbox that lets food entrepreneurs in El Salvador stress-test unconventional pupusa configurations — alternative doughs, gourmet proteins, cross-cultural filling compositions — against a statistically grounded synthetic focus group before committing a single dollar to production.

The application ingests the **NVIDIA Nemotron-Personas-El-Salvador** synthetic demographic dataset, enriches each persona with a realistic 2026 income band derived from EHPM (Encuesta de Hogares de Propósitos Múltiples) data, and dispatches each enriched profile to `claude-sonnet-4-6` via the official Anthropic JavaScript SDK. The model evaluates the proposed recipe and price point from the persona's cultural, regional, and socio-economic perspective, returning a structured JSON payload containing an acceptance score, a binary acceptance decision, and a qualitative critique written in authentic Salvadoran **Caliche** slang.

The entire runtime experience ships as a **single `index.html` file** — no build toolchain, no bundler, no framework, no server. It runs from `file://` or any static host.

### Why This Exists

Traditional food-sector focus groups in El Salvador are:

| Constraint | Reality |
|---|---|
| **Cost** | USD $800 – $2,400 per session |
| **Speed** | 6 – 10 weeks from recruitment to report |
| **Coverage** | San Salvador over-represented; rural departments invisible |
| **Honesty** | Social desirability bias softens negative feedback |
| **Repeatability** | Re-runs require re-budgeting |

This sandbox eliminates every constraint. A founder can simulate 50 demographically diverse Salvadoran consumer reactions to a smoked-gouda-and-chipotle pupusa priced at $2.75 — spanning all four macro-regions and six income bands — in under 10 minutes for less than $2.00 in API cost.

---

## Table of Contents

- [Architectural Blueprint](#architectural-blueprint)
- [Technical Stack](#technical-stack)
- [Repository Structure](#repository-structure)
- [Quick-Start Guide](#quick-start-guide)
- [MCP Configuration](#mcp-configuration)
- [Anthropic Client Bootstrap](#anthropic-client-bootstrap)
- [Data Contract & Simulation Parameters](#data-contract--simulation-parameters)
- [Regional Evaluation Logic](#regional-evaluation-logic)
- [Socio-Economic Elasticity Model](#socio-economic-elasticity-model)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

---

## Architectural Blueprint

The system operates as a **two-tiered hybrid pipeline**. Development-time infrastructure is entirely local and data-sovereign. Runtime experience is stateless and browser-native.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                         HYBRID PIPELINE                                  ║
╠══════════════════════════╦═══════════════════════════════════════════════╣
║  TIER 1 — DEV TIME       ║  TIER 2 — RUNTIME                            ║
║  (Local / Agent-Assisted)║  (Browser / Stateless)                       ║
╠══════════════════════════╬═══════════════════════════════════════════════╣
║                          ║                                               ║
║  nvidia/Nemotron-SV      ║  index.html                                   ║
║  Parquet Dataset         ║  ├── Tailwind CSS (CDN)                       ║
║        │                 ║  ├── Chart.js (CDN)                           ║
║        ▼                 ║  ├── @anthropic-ai/sdk (esm.sh CDN)           ║
║  ETL + Income Injection  ║  └── Vanilla JS (ES6+, no bundler)            ║
║        │                 ║            │                                  ║
║        ▼                 ║            ▼                                  ║
║  nemotron_el_salvador.db ║  Promise.all() — parallel persona dispatches  ║
║  (SQLite, local)         ║            │                                  ║
║        │                 ║            ▼                                  ║
║        ▼                 ║  claude-sonnet-4-6 (Anthropic API)            ║
║  MCP Server              ║            │                                  ║
║  (query_personas tool)   ║            ▼                                  ║
║        │                 ║  JSON payload stream → Chart.js dashboard     ║
║        └────────────────►║  (live persona cards + regional analytics)    ║
║                          ║                                               ║
╚══════════════════════════╩═══════════════════════════════════════════════╝
```

### Tier 1 — Development Time: SQLite + MCP Server

The Nemotron-Personas-El-Salvador dataset ships as Parquet files from Hugging Face. At initialization, a one-time ETL script:

1. Converts Parquet rows to a local SQLite database (`nemotron_el_salvador.db`)
2. Injects a `monthly_income_usd` column using a weighted income-band model calibrated to 2026 EHPM data
3. Builds performance indices on `region`, `department`, and `monthly_income_usd`

The database is then exposed to **development agents** (Claude Code, automated CI pipelines, QA scripts) via an **MCP (Model Context Protocol)** server. This gives agents tool-driven, structured access to the persona cohort — enabling statistically representative sampling, demographic auditing, and sub-cohort extraction without raw SQL access.

The MCP layer is a **development-time construct only**. It never ships to the browser runtime.

### Tier 2 — Runtime: Vanilla JS Frontend + Claude API

At runtime, the browser client holds a pre-sampled cohort of persona objects (extracted from the DB during the dev phase and embedded in the HTML or fetched from a local JSON file). For each simulation run, the frontend dispatches all persona evaluations concurrently using `Promise.all()`, collecting structured JSON responses from `claude-sonnet-4-6` and rendering them progressively into a live Chart.js dashboard.

No server. No backend. No database connection in the browser.

---

## Technical Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| **Markup** | HTML5 | Semantic, ARIA-labeled |
| **Styling** | Tailwind CSS | 3.x via CDN (JIT) |
| **Logic** | Vanilla JavaScript | ES6+ — no framework, no bundler |
| **Visualization** | Chart.js | 4.x via CDN |
| **AI Client** | `@anthropic-ai/sdk` | ESM via `esm.sh` CDN |
| **AI Model** | `claude-sonnet-4-6` | Pinned — no automatic fallback |
| **Local Database** | SQLite | `nemotron_el_salvador.db` — dev-time only |
| **Agent Interface** | Model Context Protocol (MCP) | `mcp.json` — dev-time only |
| **Dataset** | `nvidia/Nemotron-Personas-El-Salvador` | Via Hugging Face Hub |

### Runtime Dependencies (CDN — no install required)

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>

<!-- Anthropic JS SDK (ESM) -->
<script type="importmap">
  { "imports": { "@anthropic-ai/sdk": "https://esm.sh/@anthropic-ai/sdk" } }
</script>
```

### Development Dependencies (local)

```
sqlite3          — database engine for ETL and MCP server
@modelcontextprotocol/sdk  — MCP server runtime
node (>=18)      — ETL script + MCP server process
python (optional) — alternative static file server
```

---

## Repository Structure

```
la-pupuseria-alquimista/
├── index.html                  # Complete runtime application (single file)
├── schema.sql                  # SQLite schema definition + index declarations
├── etl/
│   ├── ingest.js               # Parquet → SQLite ETL script with income injection
│   └── income_bands.js         # EHPM 2026 income band model
├── mcp/
│   ├── server.js               # MCP server exposing query_personas tool
│   └── mcp.json                # MCP client configuration matrix
├── data/
│   └── nemotron_el_salvador.db # Local SQLite database (gitignored)
├── PRD_La_Pupuseria_Alquimista.md  # Full Product Requirements Document
└── README.md                   # This file
```

> **Note:** `nemotron_el_salvador.db` is excluded from version control via `.gitignore`. Each developer provisions it locally by running the ETL script against the Hugging Face dataset. See [Quick-Start Guide](#quick-start-guide).

---

## Quick-Start Guide

### Prerequisites

- Node.js >= 18
- Access to the `nvidia/Nemotron-Personas-El-Salvador` dataset (Hugging Face Hub)
- An Anthropic API key (`sk-ant-api...`)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/la-pupuseria-alquimista.git
cd la-pupuseria-alquimista
```

---

### Step 2 — Initialize the Local Database Schema

The schema creates the `personas` table with all Nemotron source fields plus the injected `monthly_income_usd` column.

```bash
sqlite3 data/nemotron_el_salvador.db < schema.sql
```

**`schema.sql` — canonical table definition:**

```sql
CREATE TABLE IF NOT EXISTS personas (
    -- Nemotron source fields (preserved verbatim from dataset)
    id                  TEXT    PRIMARY KEY NOT NULL,
    name                TEXT    NOT NULL,
    age                 INTEGER NOT NULL CHECK (age BETWEEN 15 AND 85),
    region              TEXT    NOT NULL CHECK (region IN (
                                    'Central', 'Oriental', 'Occidental', 'Paracentral'
                                )),
    department          TEXT    NOT NULL,
    occupation          TEXT    NOT NULL,
    education           TEXT    NOT NULL,

    -- OCEAN personality dimensions (normalized 0.0 – 1.0)
    ocean_openness      REAL    NOT NULL CHECK (ocean_openness BETWEEN 0.0 AND 1.0),
    ocean_neuroticism   REAL    NOT NULL CHECK (ocean_neuroticism BETWEEN 0.0 AND 1.0),

    -- Injected economic enrichment (ETL-computed — not in source dataset)
    monthly_income_usd  REAL    NOT NULL CHECK (monthly_income_usd >= 85.0),

    -- Metadata
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dataset_version     TEXT    DEFAULT 'nemotron-sv-1.0'
);

CREATE INDEX IF NOT EXISTS idx_region      ON personas(region);
CREATE INDEX IF NOT EXISTS idx_department  ON personas(department);
CREATE INDEX IF NOT EXISTS idx_income      ON personas(monthly_income_usd);
CREATE INDEX IF NOT EXISTS idx_openness    ON personas(ocean_openness);
```

---

### Step 3 — Run the ETL Ingestion Script

```bash
node etl/ingest.js \
  --source hf://nvidia/Nemotron-Personas-El-Salvador \
  --db data/nemotron_el_salvador.db
```

The ETL script:
- Downloads and parses all Parquet shards from Hugging Face
- Maps each row to the `personas` schema
- Computes `monthly_income_usd` using a deterministic weighted-band model seeded by `persona.id`
- Validates `ocean_openness` and `ocean_neuroticism` range constraints
- Logs any violations to `etl/etl_errors.log` and skips invalid rows

ETL completion output:
```
[ETL] Source: nvidia/Nemotron-Personas-El-Salvador
[ETL] Rows ingested : 12,847
[ETL] Rows skipped  : 3  (see etl/etl_errors.log)
[ETL] Income injected: ✓  (EHPM 2026 bands, 6 quintile levels)
[ETL] Database       : data/nemotron_el_salvador.db (34.2 MB)
[ETL] Done.
```

---

### Step 4 — Configure and Start the MCP Server

The MCP server exposes three tools to development agents (Claude Code, automated test harnesses, sampling scripts):

- `query_personas` — filtered persona retrieval with region, income, and age constraints
- `get_persona_by_id` — single-record lookup
- `get_dataset_stats` — aggregate statistics for the loaded dataset

Start the server:

```bash
node mcp/server.js --db data/nemotron_el_salvador.db --port 3100
```

Expected output:
```
[MCP] Server listening on stdio (port 3100 for HTTP transport)
[MCP] Database: data/nemotron_el_salvador.db
[MCP] Tools registered: query_personas, get_persona_by_id, get_dataset_stats
[MCP] Ready.
```

---

### Step 5 — Launch the Frontend

The runtime is a single static HTML file. Serve it from any static file server — no build step, no compilation.

**Option A — Node.js (`npx serve`):**

```bash
npx serve . --listen 8080
# Open: http://localhost:8080/index.html
```

**Option B — Python built-in server:**

```bash
python3 -m http.server 8080
# Open: http://localhost:8080/index.html
```

**Option C — Direct file protocol (no server needed):**

```bash
open index.html   # macOS
xdg-open index.html   # Linux
```

Enter your Anthropic API key in the UI input field. The key is held in JavaScript memory only — never logged, never stored in `localStorage`, never transmitted anywhere except the Anthropic API endpoint.

---

## MCP Configuration

Place `mcp.json` at the repository root. This file is consumed by Claude Code and any agent-based tooling that needs structured access to the local persona dataset.

**`mcp/mcp.json`:**

```json
{
  "mcpServers": {
    "pupuseria-alquimista-db": {
      "command": "node",
      "args": ["mcp/server.js", "--db", "data/nemotron_el_salvador.db"],
      "env": {},
      "description": "Exposes the Nemotron-SV SQLite persona database via MCP tool interface",
      "tools": [
        {
          "name": "query_personas",
          "description": "Query Nemotron-SV personas with optional demographic filters",
          "inputSchema": {
            "type": "object",
            "properties": {
              "region": {
                "type": "string",
                "enum": ["Central", "Oriental", "Occidental", "Paracentral", "ALL"]
              },
              "limit":      { "type": "integer", "minimum": 1, "maximum": 200 },
              "min_income": { "type": "number"  },
              "max_income": { "type": "number"  },
              "min_age":    { "type": "integer" },
              "max_age":    { "type": "integer" }
            },
            "required": ["limit"]
          }
        },
        {
          "name": "get_persona_by_id",
          "description": "Fetch a single persona record by its unique ID",
          "inputSchema": {
            "type": "object",
            "properties": {
              "id": { "type": "string" }
            },
            "required": ["id"]
          }
        },
        {
          "name": "get_dataset_stats",
          "description": "Return aggregate statistics for the loaded persona dataset",
          "inputSchema": { "type": "object", "properties": {} }
        }
      ]
    }
  }
}
```

To register this MCP server with Claude Code:

```bash
claude mcp add pupuseria-alquimista-db \
  --command "node mcp/server.js --db data/nemotron_el_salvador.db"
```

---

## Anthropic Client Bootstrap

The browser client initializes the Anthropic SDK with `dangerouslyAllowBrowser: true`. This flag acknowledges that the API key is present in a browser context — acceptable here because the key is user-supplied at runtime (not hardcoded or committed), and the application is designed for local or controlled internal deployment only.

**Complete client initialization pattern:**

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Key sourced from UI input — never from environment, never hardcoded
const userApiKey = document.getElementById('api-key-input').value.trim();

const client = new Anthropic({
  apiKey: userApiKey,
  dangerouslyAllowBrowser: true  // Required for browser-side SDK usage
});

// Per-persona evaluation call
async function evaluatePersona(persona, recipeConfig) {
  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',  // Pinned — never auto-upgraded
    max_tokens: 256,                  // Strict cap: valid JSON critique < 200 tokens
    temperature: 0.75,                // Calibrated for Caliche register variation
    system:     buildSystemPrompt(persona, recipeConfig),
    messages: [
      {
        role:    'user',
        content: 'Evaluá esta pupusa y respondé con el JSON exacto según las instrucciones.'
      }
    ]
  });

  const rawText = response.content[0].text;
  return sanitizeAndValidate(rawText, persona);
}

// Parallel execution across the full cohort
async function runSimulation(cohort, recipeConfig) {
  const promises = cohort.map(persona => evaluatePersona(persona, recipeConfig));
  const results  = await Promise.all(promises);
  return results.filter(Boolean); // Strip null results from error fallbacks
}
```

> **Security note:** `dangerouslyAllowBrowser: true` is appropriate for local-deployment tools where the user owns the API key. Do not deploy this application to a public URL without adding a server-side proxy that removes the key from the browser entirely.

---

## Data Contract & Simulation Parameters

### API Payload Schema

Every call to `claude-sonnet-4-6` must return **exactly one line of raw JSON** conforming to this schema. No markdown fences, no preamble, no explanation — only the JSON object.

```json
{
  "name":       "string   — persona name echoed verbatim from dataset",
  "department": "string   — Salvadoran department (e.g., San Miguel, Usulután)",
  "region":     "string   — one of: Central | Oriental | Occidental | Paracentral",
  "score":      "integer  — 0 to 100 (cultural_score × economic_multiplier)",
  "accepted":   "boolean  — true only if score ≥ 58 AND economic_multiplier ≥ 0.35",
  "critique":   "string   — 1–3 sentences, authentic Salvadoran Caliche, zero English"
}
```

**Valid response example:**

```json
{"name":"Xiomara Hernández","department":"Usulután","region":"Oriental","score":21,"accepted":false,"critique":"No jodás maje, dos cincuenta por una pupusa con eso adentro, cabal que no. Aquí en el oriente con ese pisto nos comemos tres pupusas buenas pues, qué babosada."}
```

**Invalid response examples (rejected by sanitizer):**

```
// Markdown fence contamination — REJECTED
```json
{"name": "..."}
```

// Float score — COERCED via Math.round(), warning logged
{"score": 72.5, ...}

// Missing required key — REJECTED, fallback result injected
{"name": "...", "region": "...", "score": 55}
```

### Simulation Input Parameters

| Parameter | Type | Description |
|---|---|---|
| `concept_name` | `string` | Marketing name for the pupusa configuration |
| `filling_description` | `string` | Full filling composition (ingredients, preparation method) |
| `proposed_price_usd` | `number` | Retail price per unit in USD |
| `sample_size` | `integer` | Number of personas to evaluate (1–200) |
| `region_filter` | `string` | `"ALL"` or one of the four macro-regions |
| `inter_call_delay_ms` | `integer` | Delay between API calls (default: 800ms) |

---

## Regional Evaluation Logic

The system prompt encodes **hard behavioral constraint matrices** for each macro-region. These are not editorial suggestions — the model is instructed to treat them as binding evaluation rules.

### Cultural Baseline Scores by Region

| Region | Novel Filling Baseline | Key Behavioral Driver |
|---|---|---|
| **Central** | 55 / 100 | Urban cosmopolitanism; Instagram aesthetics; premium-brand tolerance |
| **Occidental** | 45 / 100 | Masa craftsmanship obsession; dough quality judged before filling |
| **Paracentral** | 35 / 100 | Volume and protein density as primary value signal |
| **Oriental** | 30 / 100 | Structural conservatism; fierce regional food identity; rice-dough pride |

### Regional Signal Rules (System Prompt Injections)

**Central**
- `ocean_openness > 0.6` → `+12pts` cultural boost
- "Artisanal" / "premium" framing reduces price friction
- `ocean_neuroticism > 0.7` + perceived pretension → `-15pts` penalty

**Oriental**
- Local ingredients (camarones del Golfo, queso duro oriental) → `+20pts` bonus
- Any San Salvador trend reference → `-10pts` penalty
- `ocean_openness < 0.35` + non-traditional filling → score **capped at 35**
- Any price `> $1.50` triggers mandatory price-critical Caliche language in critique

**Occidental**
- Missing masa description in recipe prompt → automatic skepticism signal
- Masa keywords ("nixtamalizada artesanal", "tortillera tradicional") → `+15pts`
- Coffee-region pairing (Ahuachapán / Santa Ana) → `+10pts`

**Paracentral**
- Critique **must** reference filling quantity ("¿y cuánto lleva adentro?")
- Non-protein premium fillings start at `35` base
- "Premium" framing without volume justification amplifies `ocean_neuroticism` penalty `+25%`

---

## Socio-Economic Elasticity Model

The economic multiplier is computed **before** each LLM call and injected into the system prompt as a non-negotiable scoring constraint. The model is instructed that `final_score = cultural_score × economic_multiplier`.

### Income Band Distribution (EHPM 2026)

| Band | Monthly Income (USD) | Population Weight |
|---|---|---|
| SUBSISTENCE | $85 – $180 | 20% |
| WORKING_CLASS | $181 – $380 | 24% |
| LOWER_MIDDLE | $381 – $650 | 26% |
| MIDDLE | $651 – $1,100 | 20% |
| UPPER_MIDDLE | $1,101 – $2,200 | 7% |
| AFFLUENT | $2,201 – $5,500 | 3% |

### Multiplier Curve

```javascript
function computeEconomicMultiplier(monthlyIncomeUsd, proposedPriceUsd) {
  const dailyDisposable = (monthlyIncomeUsd * 0.60) / 30;
  const pdr = proposedPriceUsd / dailyDisposable; // Price-to-Daily-Disposable Ratio

  if (pdr <= 0.05) return 1.00;  // Trivial spend       → no dampening
  if (pdr <= 0.15) return 1.00 - ((pdr - 0.05) / 0.10) * 0.15; // Comfortable
  if (pdr <= 0.30) return 0.85 - ((pdr - 0.15) / 0.15) * 0.25; // Stretch
  if (pdr <= 0.50) return 0.60 - ((pdr - 0.30) / 0.20) * 0.25; // Sacrifice
  return 0.10;  // > 0.50 PDR → economic impossibility floor
}
```

### Acceptance Gate (Dual Condition)

`accepted: true` requires **both** conditions to pass simultaneously:

```
score    ≥ 58   (primary cultural acceptance threshold)
AND
economic_multiplier ≥ 0.35   (economic veto floor)
```

A cultural score of `95` with an economic multiplier of `0.20` produces `accepted: false`. The model cannot override this — the multiplier is a pre-computed hard constraint, not an advisory input.

---

## Error Handling

### Payload Sanitization Pipeline

Every raw API response passes through three sanitization stages before `JSON.parse()`:

```javascript
function sanitizeRawPayload(rawText) {
  let s = rawText.trim();

  // Stage 1 — strip markdown code fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Stage 2 — extract outermost JSON object boundaries
  const start = s.indexOf('{');
  const end   = s.lastIndexOf('}');
  if (start === -1 || end === -1)
    throw new PayloadError('PAYLOAD_MALFORMED', rawText);
  s = s.slice(start, end + 1);

  // Stage 3 — soft structural validation (warn, don't hard-fail)
  const pattern = /^\{"name":".+?","department":".+?","region":".+?","score":\d+,"accepted":(?:true|false),"critique":".+?"\}$/s;
  if (!pattern.test(s))
    console.warn('[PAYLOAD] Structural pattern mismatch — attempting parse', s);

  return s;
}
```

### Graceful Fallback on Failure

When any persona evaluation fails (malformed payload, API timeout, rate limit), the pipeline:

1. Logs the error to an in-memory ledger (exported with the JSON results)
2. Injects a fallback result (`score: 0`, `accepted: false`)
3. Selects a Caliche server-error message deterministically from `persona.id`
4. Continues to the next persona — **simulation never halts**

```javascript
const CALICHE_SERVER_ERRORS = [
  "Ah maje, el sistema se puso mocho ahí pues. No jodás.",
  "Birria pura, el servidor se cayó como bolo un sábado.",
  "Qué chanda, algo salió chueco con este cipote del sistema.",
  "No cabal, el bicho del servidor se trabó. Qué babosada.",
  "Está pelado maje, no llegó la respuesta. Qué chuco."
];
```

### Error Taxonomy

| Code | Trigger | Severity | Recovery |
|---|---|---|---|
| `PAYLOAD_MALFORMED` | Response is not parseable JSON | HIGH | Fallback injected |
| `PAYLOAD_SCHEMA_VIOLATION` | Missing or wrong-typed keys | HIGH | Fallback injected |
| `PAYLOAD_MARKDOWN_CONTAMINATION` | Backtick fences present | MEDIUM | Sanitizer strips, retry parse |
| `API_TIMEOUT` | SDK call exceeds 15s | HIGH | Fallback injected |
| `API_RATE_LIMIT` | HTTP 429 | MEDIUM | 5s backoff, single retry |
| `API_AUTH_FAILURE` | HTTP 401 / 403 | CRITICAL | Simulation halted, UI error banner |
| `MCP_QUERY_FAILURE` | MCP server unreachable | CRITICAL | Simulation blocked at preflight |
| `SCORE_OUT_OF_RANGE` | `score` outside [0, 100] | MEDIUM | `Math.round()` + clamp applied |

---

## Contributing

This is a Freedom Tech, data-sovereign project. Contributions that extend regional behavioral matrices, improve income band modeling, or expand the dataset coverage to other Central American countries are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/region-expansion-nicaragua`
3. Run the ETL against your target dataset
4. Verify the MCP tool contract is preserved (`get_dataset_stats` must return valid JSON)
5. Open a pull request with a description of the behavioral matrix changes

**Non-goals for this project:**
- Server-side infrastructure or database connections in the browser
- Framework dependencies (React, Vue, Svelte)
- Auto-upgrading the pinned model away from `claude-sonnet-4-6`
- Storing API keys anywhere outside the user's runtime memory

---

## License

MIT — see [LICENSE](LICENSE).

---

*La Pupusería Alquimista — built on Freedom Tech, local data sovereignty, and the oldest food tradition in El Salvador.*
