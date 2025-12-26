"""
Chatbot service using Google Generative AI (Gemini).
"""

import os
import google.generativeai as genai
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class ChatbotService:
    """Chatbot service using Gemini LLM."""

    def __init__(self):
        """Initialize Gemini model."""
        self.model = self._init_model()

    def _init_model(self):
        """Initialize Gemini model with configuration."""
        api_key = settings.GOOGLE_API_KEY
        if not api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY not found in environment variables. "
                "Set GOOGLE_API_KEY or GEMINI_API_KEY."
            )

        genai.configure(api_key=api_key)
        logger.info(f"Initialized Gemini model: {settings.GEMINI_MODEL}")

        return genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=(
                "Bạn là chatbot giao tiếp bằng giọng nói. "
                "Trả lời hoàn toàn bằng tiếng Việt, ngắn gọn, tự nhiên, thân thiện. "
                "Điều chỉnh giọng điệu phù hợp với trạng thái người dùng. "
                "KHÔNG nói tên cảm xúc, KHÔNG phán xét."
            ),
            generation_config={
                "temperature": settings.LLM_TEMPERATURE,
                "max_output_tokens": settings.LLM_MAX_TOKENS,
            },
        )

    def get_reply(self, user_text: str, emotion: str = "neutral") -> str:
        """
        Generate chatbot reply based on user text and emotion.

        Args:
            user_text: User's message
            emotion: Detected emotion (used for context)

        Returns:
            Chatbot's reply

        Raises:
            RuntimeError: If generation fails
        """
        try:
            user_prompt = (
                f"Ngữ cảnh cảm xúc (ẩn, không được nhắc): {emotion}\n"
                f'Người dùng nói: "{user_text}"'
            )

            response = self.model.generate_content(user_prompt)
            reply_text = (response.text or "").strip()

            if not reply_text:
                logger.warning("Empty response from Gemini")
                return "Xin lỗi, tôi không hiểu. Vui lòng thử lại."

            logger.info(f"Chat response generated: {len(reply_text)} characters")
            return reply_text

        except Exception as e:
            logger.error(f"Chatbot error: {e}")
            raise RuntimeError(f"Failed to generate chat response: {str(e)}")


# Singleton instance
chatbot_service = ChatbotService()
