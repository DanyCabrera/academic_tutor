import shutil
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

from app.api.schemas import (
    MaterialOut,
    MessageOut,
    NOTEBOOK_COLOR_KEYS,
    SessionColorUpdate,
    SessionCreate,
    SessionOut,
    SessionUpdate,
)
from app.config import get_settings
from app.dependencies import get_rag, get_store

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _session_out(session) -> SessionOut:
    return SessionOut(
        id=session.id,
        title=session.title,
        color=getattr(session, "color", None) or "blue",
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


def _validate_color(color: str) -> str:
    if color not in NOTEBOOK_COLOR_KEYS:
        raise HTTPException(
            400,
            f"Color no válido. Opciones: {', '.join(sorted(NOTEBOOK_COLOR_KEYS))}",
        )
    return color


async def _cleanup_session_files(session_id: str, materials) -> None:
    settings = get_settings()
    session_dir = Path(settings.upload_dir) / session_id
    if session_dir.exists():
        shutil.rmtree(session_dir, ignore_errors=True)
    for material in materials:
        if material.source_path:
            path = Path(material.source_path)
            if path.is_file():
                path.unlink(missing_ok=True)


@router.post("", response_model=SessionOut)
async def create_session(body: SessionCreate):
    store = get_store()
    color = _validate_color(body.color)
    session = await store.create_session(title=body.title, color=color)
    return _session_out(session)


@router.get("", response_model=list[SessionOut])
async def list_sessions():
    store = get_store()
    sessions = await store.list_sessions()
    return [_session_out(s) for s in sessions]


@router.get("/{session_id}", response_model=SessionOut)
async def get_session(session_id: str):
    store = get_store()
    session = await store.get_session(session_id)
    if not session:
        raise HTTPException(404, "Sesión no encontrada")
    return _session_out(session)


async def _apply_session_title(session_id: str, title: str) -> SessionOut:
    store = get_store()
    session = await store.get_session(session_id)
    if not session:
        raise HTTPException(404, "Sesión no encontrada")
    cleaned = title.strip()
    if not cleaned:
        raise HTTPException(400, "El título no puede estar vacío")
    await store.update_session_title(session_id, cleaned)
    session = await store.get_session(session_id)
    assert session is not None
    return _session_out(session)


@router.patch("/{session_id}", response_model=SessionOut)
async def update_session_patch(session_id: str, body: SessionUpdate):
    return await _apply_session_title(session_id, body.title)


@router.put("/{session_id}", response_model=SessionOut)
async def update_session_put(session_id: str, body: SessionUpdate):
    return await _apply_session_title(session_id, body.title)


@router.post("/{session_id}/rename", response_model=SessionOut)
async def rename_session(session_id: str, body: SessionUpdate):
    return await _apply_session_title(session_id, body.title)


@router.post("/{session_id}/color", response_model=SessionOut)
async def update_session_color(session_id: str, body: SessionColorUpdate):
    store = get_store()
    session = await store.get_session(session_id)
    if not session:
        raise HTTPException(404, "Sesión no encontrada")
    color = _validate_color(body.color)
    await store.update_session_color(session_id, color)
    session = await store.get_session(session_id)
    assert session is not None
    return _session_out(session)


@router.delete("/{session_id}", status_code=204)
async def delete_session(session_id: str):
    store = get_store()
    rag = get_rag()
    session = await store.get_session(session_id)
    if not session:
        raise HTTPException(404, "Sesión no encontrada")
    materials = await store.delete_session(session_id)
    rag.delete_session_data(session_id)
    await _cleanup_session_files(session_id, materials)
    return Response(status_code=204)


@router.get("/{session_id}/messages", response_model=list[MessageOut])
async def get_messages(session_id: str):
    store = get_store()
    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")
    messages = await store.get_messages(session_id)
    return [
        MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.get("/{session_id}/materials", response_model=list[MaterialOut])
async def get_materials(session_id: str):
    store = get_store()
    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")
    materials = await store.list_materials(session_id)
    return [
        MaterialOut(
            id=m.id,
            name=m.name,
            kind=m.kind,
            created_at=m.created_at,
        )
        for m in materials
    ]
