from datetime import datetime
from pydantic import BaseModel, Field

NOTEBOOK_COLOR_KEYS = frozenset(
    {"blue", "amber", "emerald", "violet", "rose", "slate", "teal", "coral"}
)


class SessionCreate(BaseModel):
    title: str = "Nueva sesión"
    color: str = "blue"


class SessionUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class SessionColorUpdate(BaseModel):
    color: str = Field(..., min_length=1, max_length=32)


class SessionOut(BaseModel):
    id: str
    title: str
    color: str
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class MaterialOut(BaseModel):
    id: str
    name: str
    kind: str
    created_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)


class ChatResponse(BaseModel):
    reply: str
    context_preview: str = ""


class QuizRequest(BaseModel):
    topic: str = ""
    num_questions: int = Field(default=6, ge=3, le=10)


class TranscriptionOut(BaseModel):
    transcription: str
    chunks_indexed: int
    material_id: str


class IngestOut(BaseModel):
    chunks_indexed: int
    material_id: str
    filename: str
