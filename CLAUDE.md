Act as an elite Senior Solutions Architect and Lead Prompt Engineer specializing in multi-agent socio-demographic simulations.

We are building a geographic market-intelligence sandbox called "La Pupusería Alquimista." The goal of the application is to let Salvadoran food businesses design unconventional, novel pupusa recipes (e.g., pupusas de camarón, pupusas de pollo, pupusas de colores using spinach or beetroot dough) and instantly stress-test those menus and their pricing models against a synthetic focus group mirroring the real demographic, economic, and regional distributions of El Salvador.

To help me initialize this project in a single-file modern frontend architecture utilizing HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), and the official Anthropic Client SDK for JavaScript, please generate the complete structural baseline file that accomplishes the following technical requirements:

1. DATA REGISTRY BOOTSTRAP: Implement a structured, representative JSON array of 4 distinct personas that perfectly mirrors the schema of the 'nvidia/Nemotron-Personas-El-Salvador' dataset. The profiles must contain raw keys for: id, name, age, department, region, occupation, education, ocean_openness (1-10), ocean_neuroticism (1-10), and a realistic 'monthly_income_usd' field based on current Salvadoran salary baselines for their respective occupations. Ensure all 4 macro-regions of El Salvador (Central, Occidental, Paracentral, Oriental) are represented.

2. CULTURAL CRITERIA LOGIC: Write a highly granular system prompt configuration optimized for 'claude-sonnet-4-6'. The instructions must force the model to adopt the distinct psychological constraints of the target persona. It must evaluate the input recipe based on established Salvadoran regional boundaries (e.g., Central openness to culinary status trends vs. Oriental strict resistance to modifying classic cheese/chicharrón structures, and Occidental hyper-focus on dough consistency).

3. SOCIO-ECONOMIC PRICE ELASTICITY LOGIC: Incorporate a strict pricing impact layer inside the system prompt configuration. The simulation must dynamically calculate the ratio between a user-defined "Proposed Retail Price per Pupusa" and the persona's 'monthly_income_usd'. Low-income personas must penalize the final score heavily if the price exceeds basic food budget thresholds (e.g., higher than $1.50 USD), while high-income personas may tolerate premium pricing but demand stricter quality or aesthetic execution.

4. STRICT JSON ENFORCEMENT: The system prompt must enforce that the model returns ONLY a valid, single-line parsable JSON block with absolutely no markdown wrapper strings, no backticks, and no conversational preamble. The output schema must match this target contract:
{"name": "string", "department": "string", "region": "string", "score": integer_0_to_100, "accepted": boolean, "critique": "string_written_in_authentic_salvadoran_caliche_slang"}

5. RESILIENT JAVASCRIPT PIPELINE RUNTIME: Scaffold a clean, single-file HTML/JS interface. Include native UI inputs (select dropdowns for Base Masa, checkboxes for Core Protein Fillings, a text input for Toppings, and a range slider for the Proposed Retail Price). Build the asynchronous execution loop in JavaScript that iterates over the personas pool and executes the API calls using strictly the following official Anthropic SDK syntax targeting the specified model:

```javascript
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: "YOUR_API_KEY", dangerouslyAllowBrowser: true });
const msg = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "..." }],
});
console.log(msg.content[0].text);