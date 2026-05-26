import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.schemas import TranscriptionOut
from app.config import get_settings
from app.dependencies import get_rag, get_store
from app.services.stt import transcribe_audio

router = APIRouter(prefix="/sessions/{session_id}/audio", tags=["audio"])

AUDIO_EXT = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4", ".mpeg"}


@router.post("/upload", response_model=TranscriptionOut)
async def upload_audio(session_id: str, file: UploadFile = File(...)):
    return await _process_audio(session_id, file)


@router.post("/transcribe", response_model=TranscriptionOut)
async def transcribe_recording(session_id: str, file: UploadFile = File(...)):
    return await _process_audio(session_id, file)


async def _process_audio(session_id: str, file: UploadFile) -> TranscriptionOut:
    settings = get_settings()
    store = get_store()
    rag = get_rag()

    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")

    suffix = Path(file.filename or ".webm").suffix.lower()
    if suffix not in AUDIO_EXT:
        raise HTTPException(
            400,
            f"Formato de audio no soportado. Permitidos: {', '.join(sorted(AUDIO_EXT))}",
        )

    safe_name = f"{uuid.uuid4().hex}{suffix}"
    dest = Path(settings.upload_dir) / session_id / "audio" / safe_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(await file.read())

    try:
        transcription = transcribe_audio(dest)
    except Exception as exc:
        raise HTTPException(500, f"Error en transcripción STT: {exc}") from exc

    if not transcription.strip():
        raise HTTPException(400, "No se detectó voz en el audio.")

    label = file.filename or f"transcripción_{safe_name}"
    chunks = rag.ingest_text(
        session_id,
        transcription,
        source_name=label,
        kind="transcription",
    )
    material = await store.add_material(
        session_id,
        name=label,
        kind="transcription",
        source_path=str(dest),
    )

    return TranscriptionOut(
        transcription=transcription,
        chunks_indexed=chunks,
        material_id=material.id,
    )
