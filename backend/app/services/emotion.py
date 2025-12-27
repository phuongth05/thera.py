import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import WhisperModel, WhisperFeatureExtractor
import numpy as np
import soundfile as sf
import io


class WhisperAttentionClassifier(nn.Module):
    def __init__(self, num_labels=4):
        super().__init__()
        self.encoder = WhisperModel.from_pretrained("openai/whisper-tiny").encoder

        hidden_size = 384  # whisper-tiny

        # Attention layer
        self.attn_query = nn.Linear(hidden_size, 1, bias=False)

        # Classification head
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, num_labels),
        )

    def forward(self, input_features, labels=None):
        out = self.encoder(input_features=input_features)
        hidden = out.last_hidden_state  # [B, T, 384]

        attn_scores = self.attn_query(hidden)  # [B, T, 1]
        attn_weights = F.softmax(attn_scores, dim=1)  # [B, T, 1]

        context = (attn_weights * hidden).sum(dim=1)  # [B, 384]

        logits = self.fc(context)

        loss = None
        if labels is not None:
            loss = nn.CrossEntropyLoss()(logits, labels)

        return {"logits": logits, "loss": loss}


class EmotionModel:
    def __init__(self):
        from app.config import settings

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.labels = settings.EMOTION_LABELS

        self.model = WhisperAttentionClassifier(num_labels=len(self.labels)).to(
            self.device
        )

        state_dict = torch.load(settings.EMOTION_MODEL_PATH, map_location=self.device)
        self.model.load_state_dict(state_dict)

        self.model.eval()

        # Feature extractor của Whisper
        self.feature_extractor = WhisperFeatureExtractor.from_pretrained(
            "openai/whisper-tiny"
        )

    @torch.no_grad()
    def predict(self, audio_bytes: bytes):
        """
        audio_bytes: WAV audio bytes
        """
        try:
            # 1. Đọc audio từ bytes
            data, sr = sf.read(io.BytesIO(audio_bytes), dtype="float32")

            # 2. Force mono
            if data.ndim > 1:
                data = np.mean(data, axis=1)

            # 3. Feature extraction
            inputs = self.feature_extractor(data, sampling_rate=sr, return_tensors="pt")
            input_features = inputs.input_features.to(self.device)

            # 4. Predict
            outputs = self.model(input_features)
            logits = outputs["logits"]

            probs = torch.softmax(logits, dim=-1)[0]
            pred_id = torch.argmax(probs).item()

            return {
                "emotion": self.labels[pred_id],
                "confidence": probs[pred_id].item(),
            }
        except Exception as e:
            raise RuntimeError(f"Emotion detection error: {str(e)}")


# Singleton instance
emotion_service = EmotionModel()
