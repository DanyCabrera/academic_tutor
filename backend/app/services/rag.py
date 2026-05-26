from pathlib import Path
from typing import Any

import chromadb
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from app.config import get_settings


class RAGService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embeddings = OpenAIEmbeddings(
            model=self.settings.openai_embedding_model,
            api_key=self.settings.openai_api_key or None,
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
        )
        Path(self.settings.chroma_dir).mkdir(parents=True, exist_ok=True)
        self._client = chromadb.PersistentClient(path=self.settings.chroma_dir)

    def delete_session_data(self, session_id: str) -> None:
        """Remove Chroma collection and upload folder for a session."""
        collection = self._collection_name(session_id)
        try:
            self._client.delete_collection(collection)
        except Exception:
            pass

    def _collection_name(self, session_id: str) -> str:
        safe = session_id.replace("-", "_")
        return f"session_{safe}"

    def _get_store(self, session_id: str) -> Chroma:
        return Chroma(
            client=self._client,
            collection_name=self._collection_name(session_id),
            embedding_function=self.embeddings,
        )

    def ingest_text(
        self,
        session_id: str,
        text: str,
        source_name: str,
        kind: str = "document",
    ) -> int:
        if not text.strip():
            raise ValueError("El contenido está vacío.")

        docs = self.splitter.split_documents(
            [
                Document(
                    page_content=text,
                    metadata={
                        "session_id": session_id,
                        "source": source_name,
                        "kind": kind,
                    },
                )
            ]
        )
        store = self._get_store(session_id)
        store.add_documents(docs)
        return len(docs)

    def retrieve(self, session_id: str, query: str) -> list[dict[str, Any]]:
        store = self._get_store(session_id)
        results = store.similarity_search_with_score(
            query, k=self.settings.retrieval_k
        )
        chunks: list[dict[str, Any]] = []
        for doc, score in results:
            chunks.append(
                {
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "desconocido"),
                    "kind": doc.metadata.get("kind", "document"),
                    "score": float(score),
                }
            )
        return chunks

    def format_context(self, chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return "No hay fragmentos relevantes en la base de conocimiento."
        lines = []
        for i, c in enumerate(chunks, 1):
            lines.append(
                f"[{i}] ({c['kind']}) {c['source']}\n{c['content']}"
            )
        return "\n\n---\n\n".join(lines)
