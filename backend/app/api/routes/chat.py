from fastapi import APIRouter, HTTPException

from app.api.schemas import ChatRequest, ChatResponse
from app.dependencies import get_store, get_tutor

router = APIRouter(prefix="/sessions/{session_id}/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(session_id: str, body: ChatRequest):
    store = get_store()
    tutor = get_tutor()

    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")

    await store.add_message(session_id, "user", body.message)
    history_msgs = await store.get_messages(session_id)
    history = [(m.role, m.content) for m in history_msgs[:-1]]

    reply, context = tutor.run(session_id, body.message, history)
    await store.add_message(session_id, "assistant", reply)

    preview = context[:1200] + ("…" if len(context) > 1200 else "")
    return ChatResponse(reply=reply, context_preview=preview)
