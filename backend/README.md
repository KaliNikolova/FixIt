# FixIt Backend

FastAPI backend for the FixIt repair app with SQLite database.

## Structure

```
backend/
├── main.py              # FastAPI app entry
├── config.py            # Environment settings
├── database.py          # SQLite connection
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── gemini_service.py    # AI service
├── routers/
│   ├── repairs.py       # CRUD for repairs
│   └── gemini.py        # AI endpoints
└── requirements.txt
```

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Environment

The `.env` file must contain:
- `GEMINI_API_KEY`: Free tier key for text analysis and standard operations.
- `GEMINI_IMAGE_API_KEY`: Billed key for high-quality image generation (Imagen).
- `GEMINI_SEARCH_API_KEY`: Key with Google Search Grounding enabled for finding manuals and technical specs.

> [!NOTE]
> You can use the same key for all three if it has the necessary permissions and billing attached.

## Run

```bash
uvicorn main:app --reload --port 8000
```

**API docs**: http://localhost:8000/docs

## Endpoints

- `POST /gemini/analyze` - Analyze repair image
- `POST /gemini/manual` - Find manual URL
- `POST /gemini/generate-step-image` - Generate step illustration
- `POST /gemini/troubleshoot` - Get troubleshooting advice
- `POST /gemini/moderate` - Moderate image
- `GET/POST /repairs/` - CRUD operations
- `GET /repairs/public` - Get community repairs
