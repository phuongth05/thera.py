"""
Main entry point for the FastAPI application.
"""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api import router

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Therapist Chat API with voice support",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static audio directory
app.mount("/audio", StaticFiles(directory=settings.AUDIO_DIR), name="audio")

# Include API routes
app.include_router(router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - returns API info."""
    return {
        "message": "Welcome to Therapist Chat API",
        "version": settings.API_VERSION,
        "docs": "/docs",
    }


@app.on_event("startup")
async def startup_event():
    """Run on app startup."""
    logger.info("Starting Therapist Chat API...")
    logger.info(f"Using device: {settings.EMOTION_MODEL_PATH}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on app shutdown."""
    logger.info("Shutting down Therapist Chat API...")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
