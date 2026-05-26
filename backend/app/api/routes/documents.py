import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.schemas import IngestOut
from app.config import get_settings
from app.dependencies import get_rag, get_store
from app.services.document_loader import load_text_from_file

router = APIRouter(prefix="/sessions/{session_id}/documents", tags=["documents"])

ALLOWED = {".pdf", ".txt", ".md", ".markdown", ".docx"}


@router.post("/upload", response_model=IngestOut)
async def upload_document(session_id: str, file: UploadFile = File(...)):
    settings = get_settings()
    store = get_store()
    rag = get_rag()

    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(
            400,
            f"Formato no soportado. Permitidos: {', '.join(sorted(ALLOWED))}",
        )

    safe_name = f"{uuid.uuid4().hex}{suffix}"
    dest = Path(settings.upload_dir) / session_id / safe_name
    dest.parent.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    dest.write_bytes(content)

    try:
        text = load_text_from_file(dest)
    except Exception as exc:
        raise HTTPException(400, f"Error al leer el documento: {exc}") from exc

    chunks = rag.ingest_text(
        session_id,
        text,
        source_name=file.filename or safe_name,
        kind="document",
    )
    material = await store.add_material(
        session_id,
        name=file.filename or safe_name,
        kind="document",
        source_path=str(dest),
    )

    return IngestOut(
        chunks_indexed=chunks,
        material_id=material.id,
        filename=file.filename or safe_name,
    )
