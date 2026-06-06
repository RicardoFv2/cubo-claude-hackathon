# La Pupusería Alquimista

> Estudio de mercado del mercado salvadoreño de pupusas usando inteligencia artificial y el dataset de personas sintéticas de NVIDIA Nemotron.

[![Model](https://img.shields.io/badge/model-claude--sonnet--4--6-orange?style=flat-square)](.)
[![Dataset](https://img.shields.io/badge/dataset-NVIDIA%20Nemotron--Personas--El--Salvador-green?style=flat-square)](.)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square)](.)

---

## ¿Qué es esto?

**La Pupusería Alquimista** es un simulador de mercado que permite evaluar recetas experimentales de pupusas ante un grupo focal sintético de 40 personas salvadoreñas antes de lanzarlas al mercado real.

El proyecto nace de una pregunta concreta: **¿cómo reaccionaría el mercado salvadoreño ante una pupusa de masa de carbón activado rellena de salmón ahumado a $2.75?** Responder esa pregunta con un focus group tradicional cuesta entre $800 y $2,400 USD y tarda semanas. Con este simulador tarda menos de 2 minutos.

---

## El dataset: NVIDIA Nemotron Personas El Salvador

El núcleo del proyecto es el dataset **[nvidia/Nemotron-Personas-El-Salvador](https://huggingface.co/datasets/nvidia/Nemotron-Personas-El-Salvador)**, un conjunto de personas sintéticas pero estadísticamente representativas de la población salvadoreña, generado por NVIDIA.

Cada persona incluye:

- **Perfil demográfico** — nombre, edad, género, municipio y departamento
- **Región geográfica** — Central, Oriental, Occidental o Paracentral
- **Dimensiones OCEAN** — apertura a experiencias y neuroticismo, que determinan su reacción ante lo nuevo y ante precios percibidos como injustos
- **Ocupación y nivel educativo** — contexto socioeconómico realista

A cada persona se le inyecta un **ingreso mensual en USD** calibrado con datos de la EHPM 2026 (Encuesta de Hogares de Propósitos Múltiples), lo que permite modelar la elasticidad precio-ingreso de forma precisa.

### Las 40 personas del estudio

El simulador trabaja con una cohorte de **40 personas** distribuidas equitativamente en las 4 macro-regiones del país (10 por región), cubriendo:

- Trabajadores de mercado y agricultores rurales del oriente
- Jóvenes tecnológicos y profesionales urbanos de la capital
- Artesanos y operarios de la zona occidental
- Pupuseras, maestras y ganaderos de la zona paracentral

Esta distribución garantiza que cada simulación capture tanto la perspectiva del consumidor urbano con mayor poder adquisitivo como la del consumidor rural con presupuesto ajustado.

---

## Cómo mide la aprobación

Para cada receta propuesta, el simulador le pregunta a cada una de las 40 personas si compraría esa pupusa. Claude (`claude-sonnet-4-6`) encarna cada perfil y evalúa la propuesta según:

1. **Identidad regional** — cada región tiene reglas de evaluación distintas. El oriente penaliza ingredientes exóticos; el occidente evalúa primero la masa; la zona paracentral exige volumen por el precio.

2. **Elasticidad económica** — el precio propuesto se compara contra el ingreso mensual de la persona. Una pupusa a $2.50 es asequible para un gerente bancario de San Salvador pero inaceptable para un jornalero de caña en San Vicente.

3. **Perfil OCEAN** — personas con alta apertura aceptan fusiones exóticas; personas con alto neuroticismo amplifican su rechazo ante precios que perciben como injustos.

Cada persona devuelve:

```json
{
  "score": 72,
  "accepted": true,
  "critique": "Está chiva la idea bróder, aunque el precio me aprieta un poco el bolsillo cabal."
}
```

Los resultados se agregan por región en un gráfico de barras y se muestran individualmente con el badge de aprobación en caliche salvadoreño auténtico.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + Vanilla JS + Tailwind CSS (CDN) |
| Visualización | Chart.js |
| Modelo | `claude-sonnet-4-6` via Anthropic API |
| Dataset | NVIDIA Nemotron-Personas-El-Salvador |
| Deploy | Vercel (serverless proxy para la API key) |

La API key vive únicamente en el servidor de Vercel como variable de entorno. El browser nunca la ve.

---

## Correrlo localmente

```bash
git clone https://github.com/RicardoFv2/cubo-claude-hackathon.git
cd cubo-claude-hackathon

# Crear config.local.json con tu API key
echo '{"apiKey":"sk-ant-api03-..."}' > config.local.json

# Servir el archivo estático
npx serve .
```

---

*Construido sobre el dataset de NVIDIA Nemotron y la tradición culinaria más antigua de El Salvador.*
