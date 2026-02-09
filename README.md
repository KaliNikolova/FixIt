<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FixIt: AI-Powered DIY Repair Guide

FixIt is a multi-modal AI application that helps you repair household items. Simply take a photo of the problem, and our AI Technician will diagnose the issue, generate a customized repair blueprint, and guide you through the process with visual aids and real-time troubleshooting.

## Architecture

The project is split into two main components:

- **[Frontend (Vite + React)](./)**: A modern, responsive React application built with Tailwind CSS.
- **[Backend (FastAPI + SQLite)](./backend/)**: A robust Python backend handling AI logic, document grounding, and local database storage.

## Quick Start

### 1. Backend Setup
The backend handles all Gemini AI logic and database operations.
```bash
cd backend
# Follow instructions in backend/README.md to setup venv and API keys
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
The frontend communicates with the backend via a configurable API URL.
```bash
# In the root directory
npm install
npm run dev
```

## Environment Variables

FixIt requires several Gemini API keys for the full feature set (Text analysis, Image generation, and Search grounding).

- **Frontend**: Requires `VITE_API_BASE_URL` (defaults to `http://localhost:8000`).
- **Backend**: Requires `GEMINI_API_KEY`, `GEMINI_IMAGE_API_KEY`, and `GEMINI_SEARCH_API_KEY`.

See [backend/README.md](./backend/README.md) for detailed key configuration.
