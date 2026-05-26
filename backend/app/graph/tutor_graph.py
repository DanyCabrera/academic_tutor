from typing import Annotated, TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages

from app.config import get_settings
from app.services.rag import RAGService

TUTOR_SYSTEM = """Eres un tutor académico personalizado, formal y claro.
Tu rol es ayudar al estudiante a estudiar usando ÚNICAMENTE el contexto proporcionado
y el historial de la conversación.

## Formato obligatorio (Markdown)
Todas tus respuestas DEBEN estar muy bien estructuradas y fáciles de escanear:

1. **Apertura breve** (1-2 líneas): resume qué vas a explicar.
2. **Cuerpo organizado** con secciones usando encabezados `##` o `###` cuando haya varios temas.
3. **Listas** para puntos clave:
   - Usa listas con viñetas `-` para ideas paralelas.
   - Usa listas numeradas `1.` solo para pasos o secuencias.
   - Una idea por viñeta; máximo 2 líneas por viñeta.
4. **Separación visual**: deja una línea en blanco entre secciones.
5. **Cierre breve** (1 línea): síntesis o siguiente paso de estudio.
6. **Énfasis**: usa **negrita** solo para términos clave, no párrafos enteros.
7. **Citas**: al final de cada viñeta relevante, indica la fuente entre corchetes, ej. [nombre del pdf].

## Reglas de contenido
- Responde en español, con tono profesional y pedagógico.
- NUNCA entregues un bloque único de texto largo sin saltos de línea ni listas.
- Si la pregunta pide resumen: usa sección `## Puntos principales` con 4-7 viñetas concretas.
- Si explicas un concepto: usa `## Definición`, `## Idea clave`, `## Ejemplo` según aplique.
- Si la pregunta no puede responderse con el contexto, indícalo con honestidad
  y sugiere qué material cargar o grabar.
- No inventes citas ni fuentes que no aparezcan en el contexto recuperado.
"""


class TutorState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    session_id: str
    user_query: str
    context: str
    response: str


def _retrieve_node(state: TutorState, rag: RAGService) -> dict:
    chunks = rag.retrieve(state["session_id"], state["user_query"])
    context = rag.format_context(chunks)
    return {"context": context}


def _generate_node(state: TutorState) -> dict:
    settings = get_settings()
    llm = ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key or None,
        temperature=0.4,
    )

    history = state.get("messages", [])
    prompt = [
        SystemMessage(content=TUTOR_SYSTEM),
        SystemMessage(
            content=f"Contexto recuperado (RAG):\n\n{state.get('context', '')}"
        ),
        *history[-12:],
        HumanMessage(content=state["user_query"]),
    ]
    result = llm.invoke(prompt)
    text = result.content if isinstance(result.content, str) else str(result.content)
    return {
        "response": text,
        "messages": [AIMessage(content=text)],
    }


class TutorAgent:
    def __init__(self, rag: RAGService | None = None) -> None:
        self.rag = rag or RAGService()
        self._graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(TutorState)

        def retrieve(state: TutorState) -> dict:
            return _retrieve_node(state, self.rag)

        graph.add_node("retrieve", retrieve)
        graph.add_node("generate", _generate_node)
        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", "generate")
        graph.add_edge("generate", END)
        return graph.compile()

    def run(
        self,
        session_id: str,
        user_query: str,
        history: list[tuple[str, str]],
    ) -> tuple[str, str]:
        messages: list[BaseMessage] = []
        for role, content in history:
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))

        result = self._graph.invoke(
            {
                "session_id": session_id,
                "user_query": user_query,
                "messages": messages,
                "context": "",
                "response": "",
            }
        )
        return result["response"], result.get("context", "")
