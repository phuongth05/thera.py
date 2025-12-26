import torch
import io
import soundfile as sf
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Optional


from emotion_model import EmotionModel
from whisper_stt import speech_to_text
from chatbot import chat_response
from tts import text_to_speech

app = FastAPI()

app.mount("/audio", StaticFiles(directory="audio"), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

emotion_model = EmotionModel("model/whisper.pt")


class ChatTextPayload(BaseModel):
    text: str
    emotion: Optional[str] = None


def _infer_emotion_from_audio(audio_bytes: bytes):
    """Convert raw bytes to waveform and run the emotion model."""
    data, sr = sf.read(io.BytesIO(audio_bytes), dtype="float32")
    waveform = torch.from_numpy(data).T
    return emotion_model.predict(waveform, sr)

@app.post("/emotion")
async def detect_emotion(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    result = _infer_emotion_from_audio(audio_bytes)
    return result


@app.post("/chat")
async def chat(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    text = speech_to_text(audio_bytes)
    emotion_result = _infer_emotion_from_audio(audio_bytes)
    emotion = emotion_result["emotion"]

    reply_text = chat_response(text, emotion)
    audio_path = text_to_speech(reply_text, emotion)

    return {
        "user_text": text,
        "reply_text": reply_text,
        "audio_url": "/" + audio_path.replace("\\", "/"),
        "emotion": emotion,
        "confidence": emotion_result.get("confidence")
    }


@app.post("/chat-text")
async def chat_text(payload: ChatTextPayload):
    """Handle text-based chat; TTS is expected to be handled client-side."""
    emotion = payload.emotion or "neutral"
    reply_text = chat_response(payload.text, emotion)

    return {
        "user_text": payload.text,
        "reply_text": reply_text,
        "emotion": emotion,
    }
