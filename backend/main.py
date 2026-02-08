"""FastAPI application for FixIt repair backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import repairs, gemini

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FixIt API",
    description="Backend API for the FixIt repair application",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(repairs.router)
app.include_router(gemini.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "FixIt API is running"}


@app.get("/health")
def health_check():
    """Health check for monitoring."""
    return {"status": "healthy"}
