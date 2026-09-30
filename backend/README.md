# RivalsPulse — Backend (MVP 2)

FastAPI service providing aggregated Marvel Rivals meta analytics.

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | FastAPI 0.115                           |
| Validation | Pydantic v2                             |
| Server     | Uvicorn (ASGI)                          |
| Config     | pydantic-settings + python-dotenv       |
| Data       | In-memory mock repos (MVP 2)            |

## Quick Start

```bash
# From /backend directory
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

# Copy env file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path                                    | Description                              |
|--------|-----------------------------------------|------------------------------------------|
| GET    | `/health`                               | Liveness check                           |
| GET    | `/api/v1/meta/heroes`                   | All heroes (filterable: role, rank, patch) |
| GET    | `/api/v1/meta/heroes/{hero_id}`         | Single hero with mapStats + patchHistory |
| GET    | `/api/v1/recommendations`               | Top picks (filterable: role, rank, mapId)|
| GET    | `/api/v1/patches`                       | All patches, newest first                |
| GET    | `/api/v1/patches/{patch_id}`            | Single patch detail                      |
| GET    | `/api/v1/patches/{patch_id}/impact`     | Hero win-rate deltas for bar chart       |

Interactive docs: http://localhost:8000/docs

## Query Parameters

### `GET /api/v1/meta/heroes`
| Param   | Type     | Example              |
|---------|----------|----------------------|
| `role`  | string   | `Vanguard`           |
| `rank`  | string   | `Diamond-Grandmaster`|
| `patch` | string   | `1.5`                |

### `GET /api/v1/recommendations`
| Param   | Type     | Example              |
|---------|----------|----------------------|
| `role`  | string   | `Duelist`            |
| `rank`  | string   | `Gold-Platinum`      |
| `mapId` | string   | `yggsgard`           |
| `limit` | int      | `3` (default, max 10)|

## Project Layout

```
backend/
├── app/
│   ├── main.py                   # FastAPI app + CORS + router wiring
│   ├── config.py                 # pydantic-settings (reads .env)
│   ├── schemas/
│   │   ├── hero.py               # HeroStats, HeroMapStat, HeroPatchHistory
│   │   ├── patch.py              # Patch, PatchHeroChange, PatchImpact
│   │   └── recommendation.py    # Recommendation
│   ├── repositories/
│   │   ├── mock_heroes.py        # In-memory heroes (mirrors heroes.ts)
│   │   ├── mock_patches.py       # In-memory patches (mirrors patches.ts)
│   │   └── mock_recommendations.py
│   └── routers/
│       ├── meta.py               # /api/v1/meta/heroes
│       ├── patches.py            # /api/v1/patches
│       └── recommendations.py   # /api/v1/recommendations
├── .env                          # Local secrets (git-ignored)
├── .env.example                  # Template
├── requirements.txt
└── README.md
```

## Response Shape Contract

All camelCase field names match the TypeScript interfaces in
`/src/lib/types/` exactly so the frontend can consume responses
without any transformation layer.
