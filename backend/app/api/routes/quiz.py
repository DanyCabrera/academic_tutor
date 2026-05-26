from fastapi import APIRouter, HTTPException

from app.api.schemas import QuizRequest
from app.dependencies import get_quiz_generator, get_store

router = APIRouter(prefix="/sessions/{session_id}/quiz", tags=["quiz"])


@router.post("/generate")
async def generate_quiz(session_id: str, body: QuizRequest):
    store = get_store()
    if not await store.get_session(session_id):
        raise HTTPException(404, "Sesión no encontrada")

    try:
        quiz = get_quiz_generator().generate(
            session_id,
            topic=body.topic,
            num_questions=body.num_questions,
        )
    except Exception as exc:
        raise HTTPException(500, f"Error al generar quiz: {exc}") from exc

    return quiz
