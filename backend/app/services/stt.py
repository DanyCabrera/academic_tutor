from pathlib import Path
from functools import lru_cache

from app.config import get_settings


@lru_cache
def _get_whisper_model():
    from faster_whisper import WhisperModel

    settings = get_settings()
    return WhisperModel(
        settings.whisper_model_size,
        device=settings.whisper_device,
        compute_type=settings.whisper_compute_type,
    )


def transcribe_audio(file_path: Path) -> str:
    """Transcribe audio file to text using faster-whisper (local STT)."""
    model = _get_whisper_model()
    segments, _info = model.transcribe(
        str(file_path),
        beam_size=5,
        vad_filter=True,
    )
    parts = [segment.text.strip() for segment in segments if segment.text.strip()]
    return " ".join(parts).strip()
