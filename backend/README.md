# Backend — Academic Tutor API

API en **Python** con FastAPI que expone RAG, chat con LangGraph, STT, quizzes y persistencia de sesiones.

---

## Requisitos

- Python **3.11** o **3.12**
- Cuenta OpenAI con API key activa
- ~2 GB de espacio libre (modelo Whisper + ChromaDB)

---

## Instalación

Desde la carpeta `backend/`:

```bash
python -m venv .venv
```

**Windows (PowerShell):**

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edita `.env` y define `OPENAI_API_KEY`.

---

## Ejecutar el servidor

```bash
# Con el venv activado, desde backend/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `GET http://localhost:8000/api/health`
- Swagger: `http://localhost:8000/docs`

---

## Variables de entorno (`.env`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | **Obligatoria** para LLM y embeddings |
| `OPENAI_CHAT_MODEL` | `gpt-4o-mini` | Modelo de conversación y quizzes |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Modelo de embeddings |
| `WHISPER_MODEL_SIZE` | `base` | Tamaño del modelo faster-whisper |
| `WHISPER_DEVICE` | `cpu` | `cpu` o `cuda` |
| `WHISPER_COMPUTE_TYPE` | `int8` | Tipo de cómputo Whisper |
| `DATA_DIR` | `./data` | Directorio de datos |
| `UPLOAD_DIR` | `./data/uploads` | Archivos subidos |
| `CHROMA_DIR` | `./data/chroma` | Vector store persistente |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/sessions.db` | Base de sesiones |
| `CORS_ORIGINS` | `http://localhost:3000` | Orígenes permitidos (CORS) |
| `CHUNK_SIZE` | `800` | Tamaño de chunk RAG |
| `CHUNK_OVERLAP` | `150` | Solapamiento de chunks |
| `RETRIEVAL_K` | `6` | Fragmentos recuperados por consulta |

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/sessions` | Crear sesión |
| `GET` | `/api/sessions` | Listar sesiones |
| `GET` | `/api/sessions/{id}/messages` | Historial de chat |
| `GET` | `/api/sessions/{id}/materials` | Materiales indexados |
| `POST` | `/api/sessions/{id}/documents/upload` | Subir PDF/TXT/DOCX |
| `POST` | `/api/sessions/{id}/audio/transcribe` | Audio → STT → RAG |
| `POST` | `/api/sessions/{id}/chat` | Mensaje al tutor |
| `POST` | `/api/sessions/{id}/quiz/generate` | Generar mini quiz |

---

## Arquitectura interna

```
app/
├── main.py              # FastAPI + CORS + lifespan
├── config.py            # Settings (pydantic-settings)
├── dependencies.py      # Singletons (RAG, tutor, DB)
├── api/routes/          # Capa HTTP
├── db/                  # SQLAlchemy async + SQLite
├── graph/tutor_graph.py # LangGraph: retrieve → generate
└── services/
    ├── rag.py           # Chroma + OpenAI embeddings
    ├── stt.py           # faster-whisper
    ├── quiz_generator.py
    └── document_loader.py
```

### Flujo RAG

1. Texto (documento o transcripción) → split en chunks.
2. Embeddings OpenAI → colección Chroma por `session_id`.
3. En el chat, LangGraph recupera chunks similares y el LLM responde con ese contexto + historial.

### Flujo STT

1. Audio guardado en `data/uploads/{session_id}/audio/`.
2. `faster-whisper` transcribe localmente.
3. La transcripción se indexa en Chroma con `kind=transcription`.

---

## Datos locales

Se crean automáticamente en `backend/data/`:

- `sessions.db` — mensajes y metadatos
- `chroma/` — vectores
- `uploads/` — archivos originales

Esta carpeta está en `.gitignore`.

---

## Solución de problemas

| Problema | Posible solución |
|----------|------------------|
| `OPENAI_API_KEY` inválida | Revisa `.env` y recarga el servidor |
| STT muy lento | Usa `WHISPER_MODEL_SIZE=tiny` o GPU con `WHISPER_DEVICE=cuda` |
| Error al instalar `faster-whisper` | Actualiza pip: `pip install -U pip` |
| CORS bloqueado | Añade la URL del frontend en `CORS_ORIGINS` |
| Chroma vacío | Sube al menos un documento o audio antes del chat |

---

## Dependencias clave

Ver `requirements.txt`: FastAPI, LangChain, LangGraph, chromadb, langchain-openai, faster-whisper, pypdf, python-docx, SQLAlchemy.
