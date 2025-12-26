"""
Application configuration.
Loads settings from environment variables or uses defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings."""

    # API
    API_TITLE: str = "Therapist Chat API"
    API_VERSION: str = "1.0.0"
    CORS_ORIGINS: list = ["*"]

    # Model paths & configs
    EMOTION_MODEL_PATH: str = "model/whisper.pt"
    EMOTION_LABELS: list = ["happy", "neutral", "sad", "angry"]

    WHISPER_MODEL: str = "small"
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    # LLM config
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 200

    # Audio config
    AUDIO_DIR: str = "audio"
    MAX_AUDIO_SIZE: int = 25 * 1024 * 1024  # 25MB
    AUDIO_CLEANUP_HOURS: int = 24

    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY", "")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
