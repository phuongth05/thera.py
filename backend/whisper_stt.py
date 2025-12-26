import tempfile
import os
import whisper

# Ưu tiên dùng checkpoint cục bộ nếu đúng định dạng Whisper gốc; nếu không, fallback về "small"
MODEL_PATH = os.path.join("model", "whisper.pt")

def _load_whisper_model():
    # openai-whisper yêu cầu checkpoint dạng chuẩn (có khóa "dims").
    # Nếu file cung cấp không đúng định dạng, ta sẽ chuyển sang model mặc định "small".
    try:
        return whisper.load_model(MODEL_PATH, device="cpu")
    except Exception:
        return whisper.load_model("small", device="cpu")


model = _load_whisper_model()


def speech_to_text(audio_bytes):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
            f.write(audio_bytes)
            tmp_path = f.name

        result = model.transcribe(tmp_path, language="vi")
        return (result.get("text") or "").strip()

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


