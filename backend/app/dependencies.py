from functools import lru_cache

from app.db.session_store import SessionStore
from app.graph.tutor_graph import TutorAgent
from app.services.quiz_generator import QuizGenerator
from app.services.rag import RAGService


@lru_cache
def get_store() -> SessionStore:
    return SessionStore()


@lru_cache
def get_rag() -> RAGService:
    return RAGService()


@lru_cache
def get_tutor() -> TutorAgent:
    return TutorAgent(rag=get_rag())


@lru_cache
def get_quiz_generator() -> QuizGenerator:
    return QuizGenerator(rag=get_rag())
