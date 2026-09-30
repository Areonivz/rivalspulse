# ⚡ RivalsPulse

RivalsPulse is a comprehensive, production-grade **Marvel Rivals Meta Analytics Platform**. The system tracks aggregate character win rates, pick velocities, patch impacts, and map-specific synergies using a privacy-first data design. It translates complex, raw data signals into an explainable, multi-factor recommendation engine.

---

## 🎨 Core Platform Features

- **Landing Dashboard (`/`):** KPI summary metrics, recent balancing updates, high-level top-performing asset grids, and interactive distribution visualizations.
- **Interactive Meta Matrix (`/meta`):** A filterable, fully sortable tabular matrix powered by **TanStack Table v9** featuring dynamic role segregation, rank filters, and patch-over-patch trend indicators.
- **Multi-Factor Recommendation Engine (`/recommendations`):** Dynamic, pool-normalized recommendation cards driven by a custom 5-component mathematical scoring schema. Includes interactive calculation modals mapping raw stats to weighted output variables.
- **Dynamic Asset Profiles (`/heroes/[heroId]`):** dynamic SSG profile screens rendering rolling historical trajectory line-charts using **Recharts**, alongside cross-referenced contextual map-affinity indexes.
- **Patch Impact Analytics (`/patches`):** Historical balancing ledger plotting comparative performance differentials, system gainers/losers, and categorized dev logs.

---

## 🏗️ Technical Architecture & Ecosystem

RivalsPulse is engineered as a decoupled full-stack application utilizing professional data design guidelines:

### Frontend
- **Framework:** Next.js 16 (TypeScript) via App Router layout paths.
- **Styling primitives:** Tailwind CSS (Dark-first gaming theme paradigm).
- **Data Layers:** TanStack Table v9 (Stable functional definitions) and Recharts.

### Backend Engine
- **Core Server:** FastAPI (Python 3.13) with fully automated CamelCase schema serialization matching frontend interfaces.
- **Data Warehouse Layer:** PostgreSQL analytics schema structured using an optimized **Medallion Data Architecture (Bronze -> Silver -> Gold)** utilizing SQLAlchemy and SQLModel models.

```text
       [ Documented MarvelRivalsAPI.com Payload ]
                          │
                          ▼
┌───────────────────────────────────────────────────────────┐
│              POSTGRESQL WAREHOUSE MATRIX                  │
│                                                           │
│  🥉 BRONZE:   raw_api_responses (Idempotency Checksums)  │
│      │                                                    │
│      ▼                                                    │
│  🥈 SILVER:   dim_heroes │ dim_maps │ fact_daily_stats    │
│      │                                                    │
│      ▼                                                    │
│  🥇 GOLD:     agg_meta_by_rank │ agg_recommendations      │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
            [ FastAPI Service Controller Layer ]
                          │
                          ▼
         [ Decoupled Client Next.js Dashboard ]
```

---

## 🚀 Local Deployment Instructions

### Prerequisites
- Node.js (v18+)
- Python (v13 or v14 configured in path context)

### 1. Backend Service Launch
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*The interactive API documentation matrix will be running locally at `http://localhost:8000/docs`*

### 2. Frontend Interface Launch
Open a parallel terminal shell in the root workspace path:
```bash
npm install
npm run dev
```
*The interactive client console matrix will initialize locally at `http://localhost:3000`*

---

## 🔒 Data Privacy Framework
To ensure absolute compliance with public platform keys, RivalsPulse operates **strictly on aggregated data models**. The database design relies on tokenized source tracking, explicitly hiding single-player operational loops, match histories, or individual identification flags across all system collection matrices.
