# La Pupusería Alquimista — Product Requirement Document

**Document Version:** 1.0.0
**Classification:** Internal Engineering & Product — CONFIDENTIAL
**Date:** 2026-06-06
**Author:** Senior PM / Architect (AI-Assisted Draft)
**Status:** DRAFT — Pending Stakeholder Ratification

---

## Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Target Dataset Architecture (NVIDIA Nemotron)](#2-target-dataset-architecture-nvidia-nemotron)
3. [Motors & Simulation Logic](#3-motors--simulation-logic)
4. [System Specifications & Tech Stack Contracts](#4-system-specifications--tech-stack-contracts)
5. [Error Handling, Guardrails & Edge Cases](#5-error-handling-guardrails--edge-cases)
6. [Appendix](#6-appendix)

---

## 1. Executive Summary & Product Vision

### 1.1 Product Identity

**Product Name:** La Pupusería Alquimista
**Codename:** `pupusa-alq-v1`
**Product Category:** AI-Powered Socio-Demographic Market Intelligence Sandbox
**Primary Market:** El Salvador — Food & Beverage Entrepreneurs, Culinary Innovators, Restaurant Groups

### 1.2 The Problem

El Salvador's pupusería sector operates on razor-thin margins and deeply conservative consumer expectations. A pupusa is not merely food — it is a cultural artifact with 2,000 years of embedded meaning. Entrepreneurs attempting to introduce premium pricing, unconventional fillings (e.g., smoked gouda with roasted beet, pulled pork with chipotle aioli), or post-artisanal positioning face a specific and underserved risk: **the total absence of low-cost, data-driven consumer signal before go-to-market.**

Traditional focus groups in El Salvador are:
- **Expensive** (USD $800–$2,400 per session for adequate regional sampling)
- **Geographically biased** (San Salvador over-represented)
- **Culturally intimidated** (respondents soften critiques when face-to-face)
- **Slow** (6–10 weeks from recruitment to report delivery)

Founders making pupusa innovation decisions are effectively flying blind across four macro-regions with structurally different income bands, cultural food codes, and price tolerance thresholds.

### 1.3 The Solution

**La Pupusería Alquimista** is a single-file, browser-native market intelligence sandbox that simulates statistically grounded consumer reactions to novel pupusa configurations and price points. It achieves this by:

1. Sourcing a local synthetic demographic population from the **NVIDIA Nemotron-Personas-El Salvador** dataset, stored and queried from a locally-managed SQLite database exposed via **MCP (Model Context Protocol)**.
2. Injecting each persona record with a **realistic 2026 Salvadoran monthly income band** derived from EHPM (Encuesta de Hogares de Propósitos Múltiples) income distribution modeling.
3. Dispatching each enriched persona to **Claude Sonnet 4.6** (`claude-sonnet-4-6`) via the Anthropic JS Client SDK with a carefully engineered split-brain prompt that forces the model to simulate culturally authentic, regionally calibrated, and economically elastic consumer behavior.
4. Rendering a live, animated results dashboard in the browser using **Chart.js**, surfacing acceptance scores, critiques in authentic Salvadoran Caliche slang, and aggregate market segmentation signals.

### 1.4 Business Value Proposition

| Dimension | Traditional Focus Group | La Pupusería Alquimista |
|---|---|---|
| **Cost per Run** | $800 – $2,400 USD | ~$0.15 – $2.00 USD (API cost) |
| **Time to Insight** | 6–10 weeks | 3–25 minutes |
| **Geographic Coverage** | San Salvador-heavy | All 4 macro-regions, 14 departments |
| **Sample Size** | 8–20 participants | Up to N personas from dataset |
| **Honesty Bias** | Social desirability effect | Zero — synthetic personas have no ego |
| **Repeatability** | Costly to re-run | Instant iteration on price/filling changes |
| **Caliche Authenticity** | Trained moderator-dependent | LLM-enforced colloquial register |

### 1.5 Strategic Objectives (OKRs)

**Objective 1 — Democratize Pre-Launch Culinary Market Research**
- KR1.1: Enable a founder to complete a 50-persona demographic simulation in under 10 minutes.
- KR1.2: Surface actionable regional segmentation signal (Central vs. Oriental vs. Occidental vs. Paracentral) in every simulation run.
- KR1.3: Deliver per-persona critiques in native Caliche register with zero English fallthrough.

**Objective 2 — Economic Fidelity**
- KR2.1: Price elasticity score degradation follows a non-linear curve calibrated to 2026 EHPM income distribution data.
- KR2.2: Zero personas from the lowest income quintile accept a pupusa priced above USD $2.50 without explicit luxury justification context.

**Objective 3 — Developer Experience**
- KR3.1: The entire product ships as a single `.html` file with zero build step, zero server requirement, and zero external asset dependencies beyond CDN.
- KR3.2: A developer can fork, configure API key, and launch a production-equivalent simulation in under 5 minutes.

---

## 2. Target Dataset Architecture (NVIDIA Nemotron)

### 2.1 Dataset Source

- **Dataset Identifier:** `nvidia/Nemotron-Personas-El-Salvador`
- **Dataset Host:** Hugging Face Hub (or local mirror)
- **Format at Rest:** Parquet → SQLite (transformed at initialization)
- **Access Layer:** SQLite database file (`personas_sv.db`) exposed via MCP server

### 2.2 SQLite Schema Definition

The canonical table is `personas`. All columns from the Nemotron source schema are preserved verbatim. One computed column (`monthly_income_usd`) is injected at ETL time and never sourced from the raw dataset.

```sql
CREATE TABLE IF NOT EXISTS personas (
    -- Core Nemotron source fields (preserved verbatim)
    id                  TEXT        PRIMARY KEY NOT NULL,
    name                TEXT        NOT NULL,
    age                 INTEGER     NOT NULL CHECK (age BETWEEN 15 AND 85),
    region              TEXT        NOT NULL CHECK (region IN ('Central', 'Oriental', 'Occidental', 'Paracentral')),
    department          TEXT        NOT NULL,
    occupation          TEXT        NOT NULL,
    education           TEXT        NOT NULL,

    -- OCEAN Personality dimensions (0.0 – 1.0 normalized float)
    ocean_openness      REAL        NOT NULL CHECK (ocean_openness BETWEEN 0.0 AND 1.0),
    ocean_neuroticism   REAL        NOT NULL CHECK (ocean_neuroticism BETWEEN 0.0 AND 1.0),

    -- Injected economic enrichment field (ETL-computed, not from source dataset)
    monthly_income_usd  REAL        NOT NULL CHECK (monthly_income_usd > 0),

    -- Metadata
    created_at          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    dataset_version     TEXT        DEFAULT 'nemotron-sv-1.0'
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_region       ON personas(region);
CREATE INDEX IF NOT EXISTS idx_department   ON personas(department);
CREATE INDEX IF NOT EXISTS idx_income_band  ON personas(monthly_income_usd);
CREATE INDEX IF NOT EXISTS idx_openness     ON personas(ocean_openness);
```

### 2.3 Income Band Injection Logic (`monthly_income_usd`)

The `monthly_income_usd` field does **not exist** in the Nemotron source dataset. It is injected during the ETL initialization pass based on a probabilistic income distribution model derived from the **2023 EHPM (DIGESTYC)** data, projected forward to 2026 with a 3.2% annual adjustment factor.

**Income Band Mapping Table (2026 Projections):**

```
┌─────────────────────┬──────────────────────────┬──────────────────────┬──────────────┐
│ Band Label          │ Monthly Income (USD)      │ EHPM Quintile        │ Pop. Weight  │
├─────────────────────┼──────────────────────────┼──────────────────────┼──────────────┤
│ SUBSISTENCE         │  85 – 180                 │ Q1 (bottom 20%)      │ 20%          │
│ WORKING_CLASS       │ 181 – 380                 │ Q2                   │ 24%          │
│ LOWER_MIDDLE        │ 381 – 650                 │ Q3                   │ 26%          │
│ MIDDLE              │ 651 – 1,100               │ Q4                   │ 20%          │
│ UPPER_MIDDLE        │ 1,101 – 2,200             │ Q5 (lower half)      │  7%          │
│ AFFLUENT            │ 2,201 – 5,500             │ Q5 (upper half)      │  3%          │
└─────────────────────┴──────────────────────────┴──────────────────────┴──────────────┘
```

**ETL Injection Pseudocode:**

```javascript
function injectMonthlyIncome(persona) {
  // Deterministic seeding from persona.id ensures reproducibility
  const seed = hashDjb2(persona.id);
  const roll = (seed % 10000) / 10000; // 0.0 – 0.9999

  // Education-weighted income modifier (+/- 15%)
  const educationModifier = {
    'Sin educación formal':  -0.12,
    'Primaria incompleta':   -0.08,
    'Primaria completa':     -0.04,
    'Secundaria':             0.00,
    'Bachillerato':           0.06,
    'Técnico':                0.10,
    'Universitario':          0.15,
    'Postgrado':              0.20,
  }[persona.education] ?? 0.00;

  const base = sampleFromWeightedBands(roll);
  return parseFloat((base * (1 + educationModifier)).toFixed(2));
}
```

### 2.4 MCP Server Contract

The SQLite database is exposed to the browser-side application via an **MCP (Model Context Protocol)** server. This server is the **sole authorized query interface** for persona retrieval.

**MCP Tool Definitions Required:**

```json
{
  "tools": [
    {
      "name": "query_personas",
      "description": "Query personas from the Nemotron-SV dataset with optional filters",
      "inputSchema": {
        "type": "object",
        "properties": {
          "region": {
            "type": "string",
            "enum": ["Central", "Oriental", "Occidental", "Paracentral", "ALL"]
          },
          "limit": { "type": "integer", "minimum": 1, "maximum": 200 },
          "min_income": { "type": "number" },
          "max_income": { "type": "number" },
          "min_age": { "type": "integer" },
          "max_age": { "type": "integer" }
        },
        "required": ["limit"]
      }
    },
    {
      "name": "get_persona_by_id",
      "description": "Retrieve a single persona record by its unique ID",
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
      "description": "Return aggregate statistics for the loaded dataset",
      "inputSchema": { "type": "object", "properties": {} }
    }
  ]
}
```

### 2.5 Data Integrity Constraints

| Rule | Policy |
|---|---|
| **Immutability** | `personas` table is READ-ONLY post-ETL. No UPDATE or DELETE operations permitted via MCP. |
| **Income Floor** | `monthly_income_usd` must never be injected below $85 (absolute Salvadoran survival floor). |
| **Region Completeness** | All four macro-regions must be present in any simulation run >20 personas. |
| **OCEAN Range** | Both OCEAN fields must be in `[0.0, 1.0]`. Violations fail validation at ETL and are logged to `etl_errors.log`. |
| **PII Policy** | `name` field is synthetic (Nemotron-generated). No real PII enters the database under any circumstances. |

---

## 3. Motors & Simulation Logic

### 3.1 Architecture Overview: The Split-Brain Prompt

Each persona evaluation is a **two-cognitive-axis LLM call**. The system prompt instructs `claude-sonnet-4-6` to evaluate the proposed pupusa configuration simultaneously across:

- **Axis A — Cultural/Regional Brain:** Region-specific food culture, tradition, social signaling, and aesthetic expectations
- **Axis B — Socio-Economic Brain:** Price-to-income ratio elasticity, value calculation, and affordability psychology

These two axes produce component sub-scores that are **multiplicatively combined** (not averaged) to yield the final `score` (0–100). This multiplicative structure ensures that a persona who culturally loves the concept but cannot economically afford it still produces a realistic low final score.

```
final_score = round(cultural_score × economic_multiplier)

Where:
  cultural_score      ∈ [0, 100]  (raw cultural acceptance)
  economic_multiplier ∈ [0.0, 1.0]  (income-elasticity dampening factor)
  final_score         ∈ [0, 100]
```

### 3.2 Cultural / Regional Bias Matrices

The following matrices define the **behavioral priors** encoded directly into the system prompt. These are not soft suggestions — they are **hard constraint rules** the model must apply.

---

#### 3.2.1 Region: CENTRAL (San Salvador, La Libertad, Chalatenango, Cuscatlán, Cabañas)

**Cultural Code:** Urban cosmopolitan tolerance. Exposure to international food media, Instagram aesthetics, and upscale restaurant culture. Highest density of salaried professionals and university graduates.

```
CENTRAL BEHAVIOR MATRIX:
┌──────────────────────────────┬──────────────────────────────────────────────────────┐
│ Signal                       │ Rule                                                 │
├──────────────────────────────┼──────────────────────────────────────────────────────┤
│ Openness to novelty          │ ocean_openness > 0.6 → cultural_score boost +12pts   │
│ Premium pricing psychology   │ "Artisanal," "premium" framing reduces price resist. │
│ Filling tolerance            │ Highest acceptance for non-traditional fillings       │
│ Social proof sensitivity     │ "Instagram-worthy" references increase score +8pts    │
│ Anti-authentic backlash      │ If filling perceived as pretentious without skill     │
│                              │ signal, ocean_neuroticism > 0.7 → penalty -15pts     │
│ Baseline cultural score      │ Start at 55 for any novel filling                    │
└──────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

#### 3.2.2 Region: ORIENTAL (San Miguel, La Unión, Morazán, Usulután)

**Cultural Code:** Structural conservatism with fierce regional pride. The Orient has its own pupusa identity (pupusas de arroz are more common). Deep suspicion of urban culinary trends. Family and community eating norms dominate over individual experience.

```
ORIENTAL BEHAVIOR MATRIX:
┌──────────────────────────────┬──────────────────────────────────────────────────────┐
│ Signal                       │ Rule                                                 │
├──────────────────────────────┼──────────────────────────────────────────────────────┤
│ Novelty resistance           │ Non-traditional fillings start at cultural_score 30  │
│ Regional pride trigger       │ Any filling using local Oriental ingredients          │
│                              │ (camarones del Golfo, queso duro oriental)           │
│                              │ adds +20pts cultural bonus                           │
│ Anti-urban reflex            │ References to San Salvador trends → -10pts           │
│ Price conservatism           │ ANY price > $1.50 triggers "too expensive for Orient"│
│                              │ penalty in critique language, regardless of income   │
│ Ocean_openness floor rule    │ If ocean_openness < 0.35 AND filling is non-trad,   │
│                              │ cultural_score is CAPPED at 35 regardless of other  │
│                              │ signals                                              │
│ Rice dough respect           │ If filling is traditional but on maíz masa, Oriental │
│                              │ persona may critique "dough authenticity"            │
└──────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

#### 3.2.3 Region: OCCIDENTAL (Santa Ana, Sonsonate, Ahuachapán)

**Cultural Code:** Corn masa craftsmanship obsession. The West is the agricultural heartland of El Salvador's maíz culture. Personas here judge the **dough execution above all else** — a mediocre filling on a perfect masa is better than an extraordinary filling on poor dough. Coffee culture influence (proximity to coffee-growing zones) creates moderate aesthetic sensibility.

```
OCCIDENTAL BEHAVIOR MATRIX:
┌──────────────────────────────┬──────────────────────────────────────────────────────┐
│ Signal                       │ Rule                                                 │
├──────────────────────────────┼──────────────────────────────────────────────────────┤
│ Dough-first evaluation       │ System prompt MUST assess masa quality before        │
│                              │ filling. If filling description lacks masa detail,   │
│                              │ Occidental persona generates skepticism.             │
│ Craftsmanship signals        │ Keywords: "masa nixtamalizada artesanal,"            │
│                              │ "tortillera tradicional," "masa de comal"            │
│                              │ → cultural bonus +15pts                              │
│ Fusion filling tolerance     │ Moderate (baseline 45). Accepts novel fillings       │
│                              │ IF masa framing is traditional                       │
│ Coffee aesthetic crossover   │ Premium coffee-flavored or coffee-paired positioning │
│                              │ adds +10pts (Ahuachapán/Santa Ana coffee region)     │
│ Price sensitivity            │ Less extreme than Oriental. Accepts up to $2.25      │
│                              │ for clearly artisanal product.                       │
│ Critique voice               │ Occidental critique MUST reference masa texture and  │
│                              │ cooking technique, not just filling flavor           │
└──────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

#### 3.2.4 Region: PARACENTRAL (La Paz, San Vicente, Zacatecoluca corridor)

**Cultural Code:** Volume and heartiness as value-signal. Paracentral consumers represent the working agricultural and light-industrial workforce. A pupusa's value is measured in **filling density and caloric satisfaction**. Thin fillings, small portions, or "fancy but light" configurations are systemically devalued. This region has the most literal price-to-portion calculation behavior.

```
PARACENTRAL BEHAVIOR MATRIX:
┌──────────────────────────────┬──────────────────────────────────────────────────────┐
│ Signal                       │ Rule                                                 │
├──────────────────────────────┼──────────────────────────────────────────────────────┤
│ Volume primacy               │ Filling density is the #1 evaluation axis            │
│ Portion language             │ Critique MUST include reference to whether filling   │
│                              │ amount justifies price ("¿y cuánto lleva adentro?")  │
│ Protein dominance            │ Pork, beans, cheese combinations score baseline 65   │
│                              │ Non-protein premium fillings start at 35             │
│ Premium skepticism           │ "Premium" framing WITHOUT volume justification       │
│                              │ → ocean_neuroticism amplified +25% in scoring        │
│ Value calculation literalism │ Paracentral persona explicitly calculates            │
│                              │ "cuántas pupusas normales puedo comprar con esto"    │
│                              │ in their rejection critiques                         │
│ Novelty with substance       │ Will accept novel fillings IF they are filling-heavy │
│                              │ and protein-based. ocean_openness moderates ±10pts   │
└──────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

### 3.3 Socio-Economic Elasticity Engine

The economic multiplier is the **second brain** of the evaluation and is computed deterministically before the LLM call, then injected into the prompt as a hard constraint.

#### 3.3.1 Price-to-Income Ratio Calculation

```javascript
function computeEconomicMultiplier(monthlyIncomeUsd, proposedPriceUsd) {
  // Daily disposable income estimate (assumes 60% non-essential spend capacity)
  const dailyDisposable = (monthlyIncomeUsd * 0.60) / 30;

  // Price-to-daily-disposable ratio
  const pdr = proposedPriceUsd / dailyDisposable;

  // Non-linear dampening curve (empirically calibrated to SV food market behavior)
  // pdr = 0.00 – 0.05 : Trivial spend → multiplier 1.00 (no dampening)
  // pdr = 0.05 – 0.15 : Comfortable spend → multiplier 0.95 – 0.85
  // pdr = 0.15 – 0.30 : Stretch spend → multiplier 0.85 – 0.60
  // pdr = 0.30 – 0.50 : Significant sacrifice → multiplier 0.60 – 0.35
  // pdr > 0.50        : Economic impossibility → multiplier caps at 0.10

  if (pdr <= 0.05)  return 1.00;
  if (pdr <= 0.15)  return 1.00 - ((pdr - 0.05) / 0.10) * 0.15;
  if (pdr <= 0.30)  return 0.85 - ((pdr - 0.15) / 0.15) * 0.25;
  if (pdr <= 0.50)  return 0.60 - ((pdr - 0.30) / 0.20) * 0.25;
  return 0.10; // Hard floor — economic impossibility regime
}
```

#### 3.3.2 Economic Multiplier Prompt Injection Contract

The computed multiplier is **not merely passed as metadata**. The system prompt explicitly instructs the model to treat it as a binding behavioral constraint on the final score:

```
ECONOMIC CONSTRAINT DIRECTIVE:
The pre-computed economic_multiplier for this persona is {MULTIPLIER}.
This value is AUTHORITATIVE and non-negotiable.
You must ensure your final score, BEFORE any rounding, equals:
  cultural_score_you_assign × {MULTIPLIER}
You may NOT inflate cultural_score to compensate for a low multiplier.
The economic reality of this persona's income is a fixed structural constraint,
not an editorial variable.
```

#### 3.3.3 Behavioral Override: Acceptance Boolean

The `acceptance` boolean in the output payload is not a simple threshold on `score`. It is governed by a **dual-gate rule**:

```javascript
function computeAcceptance(score, economicMultiplier, region, proposedPrice, income) {
  const SCORE_THRESHOLD = 58; // Primary gate
  const ECONOMIC_FLOOR  = 0.35; // Secondary gate — purely economic veto

  // A persona can "accept" at score 58+ ONLY IF the economic multiplier
  // is above the floor. Even a score of 90 does not produce acceptance=true
  // if the persona economically cannot afford the product.
  return score >= SCORE_THRESHOLD && economicMultiplier >= ECONOMIC_FLOOR;
}
```

---

### 3.4 Master System Prompt Template

```
You are simulating the authentic consumer reaction of a specific Salvadoran persona
to a proposed pupusa configuration and its retail price.

=== PERSONA IDENTITY ===
Name: {name}
Age: {age}
Region: {region}
Department: {department}
Occupation: {occupation}
Education: {education}
Monthly Income (USD): {monthly_income_usd}
OCEAN Openness Score: {ocean_openness} (0=very traditional, 1=very open)
OCEAN Neuroticism Score: {ocean_neuroticism} (0=very stable, 1=very anxious/reactive)

=== PROPOSED PUPUSA CONFIGURATION ===
Name/Concept: {concept_name}
Filling Composition: {filling_description}
Proposed Retail Price: USD ${price} per pupusa

=== ECONOMIC CONSTRAINT (BINDING) ===
Pre-computed Economic Multiplier: {economic_multiplier}
This is non-negotiable. Your final score = cultural_score × {economic_multiplier}.

=== REGIONAL BEHAVIORAL RULES (MANDATORY) ===
{region_behavior_matrix_injection}

=== OUTPUT REQUIREMENTS ===
You MUST respond with EXACTLY ONE LINE of raw JSON. No markdown. No backticks.
No explanation. No preamble. No trailing text. Just the JSON object.

Required schema:
{"name":string,"region":string,"score":integer_0_to_100,"acceptance":boolean,"critique":string}

CRITIQUE REQUIREMENTS:
- Written entirely in authentic Salvadoran Caliche slang
- 1–3 sentences maximum
- Must reference at least one region-specific behavioral signal from the matrix
- Must reference the price if the economic multiplier is below 0.55
- Zero English words permitted
- Zero formal Spanish — this is street-level Caliche only

CALICHE REFERENCE VOCABULARY (non-exhaustive):
cipote, bolo, chivo, chato, pisto, maje, bicho, cabal,
qué chuco, está a la gran, qué babosada, pues, ¿ya ves?,
a toda, está cachimbón, qué suave, no jodás, está bien güevo,
qué chanda, está pelado, ¿qué onda?, caishte, birria

EXAMPLE OF VALID OUTPUT (do not copy — this is structural only):
{"name":"María López","region":"Oriental","score":24,"acceptance":false,"critique":"No jodás maje, dos dólares por una pupusa con esa babosada adentro, cabal que no. Aquí en el oriente con ese pisto comprás tres pupusas buenas pues."}
```

---

## 4. System Specifications & Tech Stack Contracts

### 4.1 Delivery Model

| Attribute | Specification |
|---|---|
| **Delivery Format** | Single self-contained `.html` file |
| **Build System** | None — zero build step required |
| **Server Requirement** | None — runs from `file://` protocol or any static host |
| **External Asset Dependencies** | CDN-only (Tailwind, Chart.js, Anthropic SDK via esm.sh) |
| **Minimum Browser Target** | Chrome 108+, Firefox 109+, Safari 16.4+ |
| **Mobile Support** | Responsive but desktop-optimized (data-dense UI) |

### 4.2 Core Technology Stack

```
┌─────────────────────────┬──────────────────────────────────────────────────────────┐
│ Layer                   │ Technology & Version Contract                            │
├─────────────────────────┼──────────────────────────────────────────────────────────┤
│ Markup                  │ HTML5 (semantic, ARIA-labeled)                           │
│ Styling                 │ Tailwind CSS 3.x (CDN build, JIT via CDN script)         │
│ Logic                   │ Vanilla JavaScript ES6+ (no framework, no bundler)       │
│ Visualization           │ Chart.js 4.x (CDN)                                       │
│ AI Client               │ @anthropic-ai/sdk (ESM via esm.sh or skypack CDN)        │
│ AI Model                │ claude-sonnet-4-6 (PINNED — no fallback to other models) │
│ Data Layer              │ SQLite via MCP server (query_personas tool)              │
│ Icon System             │ Heroicons or Lucide (SVG inline, no icon font CDN)       │
└─────────────────────────┴──────────────────────────────────────────────────────────┘
```

### 4.3 Anthropic SDK Integration Contract

```javascript
// MANDATORY: Do not use fetch() directly. Use the official SDK.
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: userProvidedKey, // injected from UI input, never hardcoded
  dangerouslyAllowBrowser: true // required for browser-side SDK usage
});

// Call contract for each persona evaluation
const response = await client.messages.create({
  model: 'claude-sonnet-4-6', // PINNED — immutable in production
  max_tokens: 256,            // Strict cap — valid JSON critique < 200 tokens
  temperature: 0.75,          // Calibrated for creative Caliche variation
  system: buildSystemPrompt(persona, config),
  messages: [
    {
      role: 'user',
      content: 'Evaluá esta pupusa y respondé con el JSON exacto según las instrucciones.'
    }
  ]
});
```

### 4.4 Runtime Data Contract: Output Payload Schema

This is the **binding interface contract** between the LLM response and the frontend rendering pipeline. Any deviation from this schema triggers the error handling subsystem (see §5).

```typescript
// TypeScript definition for documentation purposes only
// (Runtime validation is regex + JSON.parse in vanilla JS)

interface PersonaEvaluationPayload {
  name:       string;   // Persona's name from dataset — echoed verbatim
  region:     string;   // One of: "Central" | "Oriental" | "Occidental" | "Paracentral"
  score:      number;   // Integer 0–100 (inclusive)
  acceptance: boolean;  // True only if dual-gate passes (see §3.3.3)
  critique:   string;   // 1–3 sentences, Caliche only, no English, no formal Spanish
}
```

**JSON Encoding Rules (enforced by prompt and validated by regex):**

1. Single line — no `\n` characters at root level
2. No wrapping markdown fences (` ``` `, `json`, etc.)
3. No leading/trailing whitespace outside the JSON object
4. `score` must be a bare integer — no float, no string-wrapped number
5. `acceptance` must be bare `true` or `false` — no string wrapping
6. `critique` must be a JSON-encoded string (standard escape sequences permitted)
7. No additional keys beyond the five defined — strict schema, no extensions

### 4.5 UI Component Inventory

```
DASHBOARD LAYOUT (desktop-first, 3-column grid at lg breakpoint):
┌─────────────────────────────────────────────────────────────────────┐
│                    HEADER — La Pupusería Alquimista                 │
├──────────────────┬───────────────────────┬──────────────────────────┤
│  CONFIG PANEL    │  LIVE RESULTS FEED     │  ANALYTICS PANEL         │
│  ─────────────   │  ──────────────────    │  ───────────────          │
│  Concept Name    │  Persona cards         │  Doughnut: Accept/Reject │
│  Filling Desc    │  streaming in          │  Bar: Score by Region    │
│  Price (USD)     │  as simulation runs    │  Line: Score over time   │
│  Sample Size     │                        │  Stat: Avg Score         │
│  Region Filter   │  [Score badge]         │  Stat: Accept Rate %     │
│  API Key input   │  [Caliche critique]    │  Stat: Avg Income band   │
│  [RUN BUTTON]    │  [Accept/Reject pill]  │                          │
└──────────────────┴───────────────────────┴──────────────────────────┘
│                    AGGREGATE INSIGHTS FOOTER                         │
│  Regional breakdown table + Export to JSON button                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.6 Concurrency & Rate Management

```javascript
// Sequential processing with configurable batch delay
// Rationale: prevent API rate limit hits and allow UI streaming effect

const INTER_CALL_DELAY_MS = 800; // Default — configurable by user in UI

async function runSimulation(personas, config) {
  const results = [];
  for (const persona of personas) {
    const result = await evaluatePersona(persona, config);
    results.push(result);
    renderLiveCard(result); // Update UI immediately after each persona
    updateCharts(results);  // Rerender charts incrementally
    await sleep(INTER_CALL_DELAY_MS);
  }
  return results;
}
```

---

## 5. Error Handling, Guardrails & Edge Cases

### 5.1 Error Taxonomy

| Error Class | Trigger Condition | Severity |
|---|---|---|
| `PAYLOAD_MALFORMED` | LLM response is not valid JSON | HIGH |
| `PAYLOAD_SCHEMA_VIOLATION` | Valid JSON but missing required keys or wrong types | HIGH |
| `PAYLOAD_MARKDOWN_CONTAMINATION` | Response wrapped in backticks or `json` prefix | MEDIUM |
| `PAYLOAD_ENGLISH_CONTAMINATION` | Critique contains English words | LOW |
| `API_TIMEOUT` | SDK call exceeds 15 seconds | HIGH |
| `API_RATE_LIMIT` | HTTP 429 from Anthropic API | MEDIUM |
| `API_AUTH_FAILURE` | HTTP 401/403 — invalid API key | CRITICAL |
| `MCP_QUERY_FAILURE` | SQLite MCP server unresponsive | CRITICAL |
| `SCORE_OUT_OF_RANGE` | Parsed `score` not in [0, 100] | MEDIUM |
| `EMPTY_DATASET` | Query returns 0 personas | CRITICAL |

### 5.2 Regex Sanitization Pipeline

Before `JSON.parse()` is called, every raw LLM response string is passed through a sequential sanitization pipeline:

```javascript
function sanitizeRawPayload(rawText) {
  let cleaned = rawText.trim();

  // Stage 1: Strip markdown code fences (most common LLM contamination pattern)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Stage 2: Strip any leading/trailing non-JSON characters before first `{`
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd   = cleaned.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new PayloadError('PAYLOAD_MALFORMED', 'No JSON object boundary found', rawText);
  }
  cleaned = cleaned.slice(jsonStart, jsonEnd + 1);

  // Stage 3: Normalize escaped newlines within string values (defensive)
  // We do NOT strip \n globally — we only ensure the outer structure is single-line

  // Stage 4: Validate structure before parse (fast fail on obvious corruption)
  const structurePattern = /^\{"name":".+?","region":".+?","score":\d+,"acceptance":(?:true|false),"critique":".+?"\}$/s;
  if (!structurePattern.test(cleaned)) {
    // Soft warn — still attempt parse, do not hard fail yet
    console.warn('[PAYLOAD] Structure regex did not match — attempting parse anyway', cleaned);
  }

  return cleaned;
}
```

### 5.3 Schema Validation Post-Parse

```javascript
function validatePayload(parsed, personaName, personaRegion) {
  const errors = [];

  // Name validation
  if (typeof parsed.name !== 'string' || parsed.name.trim().length === 0)
    errors.push('name: missing or empty');

  // Region validation
  const validRegions = ['Central', 'Oriental', 'Occidental', 'Paracentral'];
  if (!validRegions.includes(parsed.region))
    errors.push(`region: invalid value "${parsed.region}"`);

  // Score validation
  if (!Number.isInteger(parsed.score) || parsed.score < 0 || parsed.score > 100)
    errors.push(`score: out of range or non-integer "${parsed.score}"`);

  // Acceptance validation
  if (typeof parsed.acceptance !== 'boolean')
    errors.push(`acceptance: non-boolean "${parsed.acceptance}"`);

  // Critique validation
  if (typeof parsed.critique !== 'string' || parsed.critique.trim().length < 10)
    errors.push('critique: missing or too short');

  if (errors.length > 0) {
    throw new PayloadError('PAYLOAD_SCHEMA_VIOLATION', errors.join(' | '), parsed);
  }

  return parsed;
}
```

### 5.4 Graceful Fallback Protocol

When any error is caught during persona evaluation, the system **must not halt the simulation pipeline**. It must:

1. Log the failure to an in-memory error ledger
2. Inject a standardized **fallback persona result** into the UI feed
3. Emit a Caliche server-failure notification in the UI card
4. Increment the error counter in the analytics panel
5. Continue to the next persona without pause

```javascript
function buildFallbackResult(persona, errorClass, rawResponse) {
  const calicheServerErrors = [
    "Ah maje, el sistema se puso mocho ahí pues. No jodás.",
    "Birria pura, el servidor se cayó como bolo un sábado.",
    "Qué chanda, algo salió chueco con este cipote del sistema.",
    "No cabal, el bicho del servidor se trabó. Qué babosada.",
    "Está pelado maje, no llegó la respuesta. Qué chuco."
  ];

  // Deterministic selection from error messages using persona.id hash
  const errorMsg = calicheServerErrors[hashDjb2(persona.id) % calicheServerErrors.length];

  return {
    name:       persona.name,
    region:     persona.region,
    score:      0,                // Hard zero — never interpolate or estimate
    acceptance: false,            // Hard false — failed evaluations never accept
    critique:   errorMsg,
    __error:    true,             // Internal flag for UI rendering (not in contract schema)
    __errorClass: errorClass,
    __rawResponse: rawResponse?.slice(0, 500) // Truncated for error log only
  };
}
```

### 5.5 API Key Guard

```javascript
// Validated on Run button click — before any API call is made
function validateApiKey(key) {
  if (!key || typeof key !== 'string') return false;
  // Anthropic API key format: sk-ant-api03-[base64-like string]
  return /^sk-ant-api\d{2}-[A-Za-z0-9\-_]{80,}$/.test(key.trim());
}
```

If validation fails, the Run button remains disabled and a UI warning is shown. The key is **never logged, never stored in localStorage**, and is held only in JavaScript memory for the duration of the session.

### 5.6 MCP Server Availability Guard

Before the simulation begins, the system issues a **preflight call** to `get_dataset_stats`. If this call fails or times out in 5 seconds, the simulation is blocked with a critical error state:

```
CRITICAL: MCP server unreachable. Dataset unavailable.
Ensure the SQLite MCP server is running at the configured endpoint.
Simulation cannot proceed without the persona dataset.
```

### 5.7 Edge Case Matrix

| Edge Case | Detection | Behavior |
|---|---|---|
| `score` returned as float (e.g., `72.5`) | `!Number.isInteger(parsed.score)` | `Math.round()` applied, warning logged |
| LLM returns multiple JSON objects on multiple lines | `lastIndexOf('}')` extraction | Takes outermost first-last `{}` boundary |
| Critique contains English words | Post-parse regex `/\b(the\|this\|is\|and\|for\|with\|not)\b/i` | Warning card badge appended — simulation continues |
| All 50 personas return `acceptance: false` | Post-simulation aggregate check | "MERCADO RECHAZA" summary banner rendered in red |
| `monthly_income_usd` < 85 in DB | Pre-simulation validation pass | Persona skipped with warning — ETL data integrity failure |
| User submits price = $0.00 | UI-side form validation | Run blocked — "El precio no puede ser cero, maje." |
| Region filter produces 0 personas | Post-MCP-query count check | Run blocked — user prompted to expand region filter |

---

## 6. Appendix

### 6.1 Caliche Linguistic Register — Reference Grammar Rules

For prompt engineering and QA validation, the following rules define authentic Salvadoran Caliche as required by this system:

| Rule | Specification |
|---|---|
| **Salutation absence** | No "hola," "buenos días," or formal greetings |
| **Tuteo mandatory** | Always `vos` (not `tú` or `usted`) for second-person references |
| **Key markers required** | At least one of: `maje`, `pues`, `cabal`, `cipote`, `pisto`, `bicho` |
| **English zero-tolerance** | No English loanwords except established Caliche borrowings (e.g., "jonrón" is acceptable; "cool" is not) |
| **Formal Spanish banned** | No `usted`, no `asimismo`, no `por consiguiente`, no bureaucratic register |
| **Rhetorical question encouraged** | Caliche critiques frequently end in `¿ya ves?` or `¿qué onda?` |

### 6.2 Income Band Sampling — Weighted Random Draw Algorithm

```javascript
const INCOME_BANDS = [
  { min: 85,   max: 180,   weight: 0.20, label: 'SUBSISTENCE' },
  { min: 181,  max: 380,   weight: 0.24, label: 'WORKING_CLASS' },
  { min: 381,  max: 650,   weight: 0.26, label: 'LOWER_MIDDLE' },
  { min: 651,  max: 1100,  weight: 0.20, label: 'MIDDLE' },
  { min: 1101, max: 2200,  weight: 0.07, label: 'UPPER_MIDDLE' },
  { min: 2201, max: 5500,  weight: 0.03, label: 'AFFLUENT' },
];

function sampleFromWeightedBands(normalizedSeed) {
  let cumulative = 0;
  for (const band of INCOME_BANDS) {
    cumulative += band.weight;
    if (normalizedSeed < cumulative) {
      // Uniform sample within the selected band
      const range = band.max - band.min;
      const position = (normalizedSeed / band.weight) % 1.0;
      return band.min + Math.floor(position * range);
    }
  }
  return INCOME_BANDS.at(-1).min; // Fallback to last band floor
}
```

### 6.3 Glossary

| Term | Definition |
|---|---|
| **Caliche** | El Salvador's distinct colloquial Spanish dialect with unique vocabulary, rhythm, and cultural markers |
| **EHPM** | Encuesta de Hogares de Propósitos Múltiples — El Salvador's official household income survey (DIGESTYC) |
| **MCP** | Model Context Protocol — Anthropic's open standard for connecting LLMs to external data sources and tools |
| **OCEAN** | Big Five personality model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) |
| **PDR** | Price-to-Daily-Disposable Ratio — the core economic elasticity variable in §3.3.1 |
| **Split-Brain Prompt** | Architectural pattern where a single LLM call is instructed to evaluate across two independent cognitive axes simultaneously |
| **Pupusa** | El Salvador's national dish — a thick corn or rice masa cake filled with cheese, beans, pork, or combinations thereof |

### 6.4 Revision History

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0.0 | 2026-06-06 | PM/Architect | Initial draft — all five sections complete |

---

*End of Document — La Pupusería Alquimista PRD v1.0.0*
