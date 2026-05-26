# Academic Tutor

Aplicación web tipo **NotebookLM** para apoyo académico personalizado. Permite cargar material de estudio, transcribir audio (STT), conversar con un tutor basado en **RAG**, y generar **mini quizzes** de práctica.

El repositorio está dividido en dos carpetas independientes:

| Carpeta | Stack | Rol |
|---------|-------|-----|
| [`backend/`](backend/) | Python, FastAPI, LangChain, LangGraph, ChromaDB, faster-whisper | API, RAG, STT, quizzes, persistencia |
| [`frontend/`](frontend/) | Next.js 15, React, Tailwind CSS | Interfaz web formal con colores mates |

---

## Funcionalidades

- Carga de documentos (PDF, TXT, MD, DOCX) indexados en vector store
- Carga o **grabación** de audio con transcripción STT local (faster-whisper)
- Transcripciones integradas al flujo **RAG** junto con documentos
- **Chat** con tutor (LangGraph: recuperación → generación)
- Respuestas con contexto recuperado visible en la UI
- **Mini quizzes** generados desde el material indexado
- **Memoria conversacional** por sesión (historial de mensajes)
- **Persistencia** de sesiones y materiales (SQLite)

---

## Requisitos previos

- **Node.js** 18+ y npm
- **Python** 3.11 o 3.12
- **OpenAI API Key** (LLM + embeddings)
- (Opcional) GPU/CUDA para STT más rápido; por defecto corre en CPU

---

## Inicio rápido

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edita `backend/.env` y configura al menos:

```env
OPENAI_API_KEY=sk-...
```

Levanta la API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env.local   # Windows
# cp .env.example .env.local   # macOS/Linux
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
academic_tutor/
├── README.md                 # Este archivo
├── backend/
│   ├── app/
│   │   ├── api/routes/       # REST: sessions, documents, audio, chat, quiz
│   │   ├── db/               # SQLite + modelos
│   │   ├── graph/            # LangGraph (tutor)
│   │   └── services/         # RAG, STT, quiz, loaders
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
└── frontend/
    ├── src/
    │   ├── app/              # Páginas Next.js
    │   ├── components/       # UI: chat, materiales, quiz
    │   └── lib/api.ts        # Cliente HTTP
    ├── package.json
    ├── .env.example
    └── README.md
```

---

## Flujo de uso recomendado

1. Crear una **nueva sesión** desde la pantalla principal.
2. Subir **documentos** o **grabar/subir audio** (se transcribe e indexa).
3. Preguntar al **tutor** en el chat (RAG + historial).
4. Generar un **mini quiz** sobre un tema o el material general.
5. Revisar el panel de **contexto recuperado** tras cada respuesta.

---

## Variables de entorno

| Variable | Ubicación | Descripción |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | `backend/.env` | Clave para chat y embeddings |
| `OPENAI_CHAT_MODEL` | `backend/.env` | Modelo de chat (default: `gpt-4o-mini`) |
| `WHISPER_MODEL_SIZE` | `backend/.env` | Modelo STT local (`base`, `small`, etc.) |
| `CORS_ORIGINS` | `backend/.env` | Origen del frontend |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | URL base de la API |

Detalle completo en [`backend/README.md`](backend/README.md) y [`frontend/README.md`](frontend/README.md).

---

## Tecnologías

- **Frontend:** Next.js, React, Tailwind CSS, Web Audio API
- **Backend:** FastAPI, LangChain, LangGraph, ChromaDB, OpenAI Embeddings, faster-whisper
- **Persistencia:** SQLite (sesiones/mensajes), ChromaDB (vectores), disco (uploads)

---

## Notas

- La primera transcripción de audio descarga el modelo Whisper; puede tardar varios minutos.
- Sin material indexado, el tutor indicará que falta contexto.
- Los datos locales se guardan en `backend/data/` (no versionado).

---

## Licencia

Proyecto académico — Grupo 1.
