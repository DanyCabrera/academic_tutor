import json
import re

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import get_settings
from app.services.rag import RAGService

QUIZ_SYSTEM = """Generas mini quizzes de práctica para estudio universitario.
Responde SOLO con JSON válido, sin markdown ni texto extra.

Esquema:
{
  "title": "string",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "string breve"
    }
  ]
}

Reglas:
- Entre 5 y 8 preguntas.
- Basadas en el contexto proporcionado.
- Opciones plausibles; una sola correcta.
- explanation justifica la respuesta con el material.
"""


class QuizGenerator:
    def __init__(self, rag: RAGService | None = None) -> None:
        self.rag = rag or RAGService()
        self.settings = get_settings()

    def generate(self, session_id: str, topic: str = "", num_questions: int = 6) -> dict:
        query = topic.strip() or "conceptos clave del material de estudio"
        chunks = self.rag.retrieve(session_id, query)
        context = self.rag.format_context(chunks)

        llm = ChatOpenAI(
            model=self.settings.openai_chat_model,
            api_key=self.settings.openai_api_key or None,
            temperature=0.5,
        )
        user_prompt = (
            f"Genera un quiz de {num_questions} preguntas sobre: {query}\n\n"
            f"Contexto:\n{context}"
        )
        raw = llm.invoke(
            [SystemMessage(content=QUIZ_SYSTEM), HumanMessage(content=user_prompt)]
        )
        text = raw.content if isinstance(raw.content, str) else str(raw.content)
        return self._parse_json(text)

    def _parse_json(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", text)
            if match:
                return json.loads(match.group())
            raise ValueError("No se pudo parsear el quiz generado.") from None
