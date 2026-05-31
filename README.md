# Academic Tutor

**Tutor académico personalizado con RAG, transcripción de audio y quizzes de práctica.**

Aplicación web inspirada en NotebookLM que permite al estudiante cargar material de estudio, conversar con un tutor basado en sus propias fuentes y evaluar su comprensión mediante mini quizzes generados automáticamente.

---

## Resumen ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Propósito** | Apoyo al estudio universitario con IA anclada al material del alumno |
| **Público objetivo** | Estudiantes que preparan exámenes, trabajan con apuntes o clases grabadas |
| **Modelo de interacción** | Cuadernos de estudio independientes con fuentes, chat y herramientas de práctica |
| **Stack** | Next.js 15 + FastAPI + LangGraph + ChromaDB + OpenAI + faster-whisper |
| **Estado** | MVP funcional — Grupo 1 (proyecto académico) |

---

## Visión pedagógica

### Problema que resuelve

El estudio tradicional con PDFs, apuntes y grabaciones de clase suele ser **pasivo y fragmentado**: el alumno lee o escucha, pero le cuesta sintetizar, preguntar con contexto y comprobar si realmente entendió. Academic Tutor convierte ese material en un **espacio de estudio activo** donde la IA actúa como tutor, no como buscador genérico.

### Modelo pedagógico

El sistema implementa un ciclo de aprendizaje de cuatro fases:

```
Fuentes → Comprensión guiada → Diálogo socrático → Evaluación formativa
   ↑                                                      ↓
   └──────────── Retroalimentación y repaso ──────────────┘
```

| Fase | Herramienta | Objetivo de aprendizaje |
|------|-------------|-------------------------|
| **1. Aportación** | Subida de PDF/DOCX/TXT/MD o grabación de audio | El alumno centraliza su material en un cuaderno temático |
| **2. Accesibilidad** | STT local (faster-whisper) | Las clases grabadas pasan a texto indexable y consultable |
| **3. Comprensión** | Chat con tutor RAG | Explicaciones estructuradas, con citas a las fuentes reales del alumno |
| **4. Consolidación** | Mini quizzes (5–8 preguntas) | Autoevaluación con explicaciones justificadas en el material |

### Principios pedagógicos incorporados

1. **Aprendizaje anclado al contexto (grounded learning)**  
   El tutor responde *únicamente* con fragmentos recuperados del material del estudiante. Si no hay contexto suficiente, lo indica con honestidad en lugar de inventar respuestas.

2. **Andamiaje estructurado**  
   El prompt del tutor exige respuestas en Markdown con secciones (`## Definición`, `## Puntos principales`), listas escaneables y citas `[nombre del pdf]`. Esto favorece la **organización cognitiva** del contenido.

3. **Memoria conversacional**  
   Se conservan los últimos 12 turnos del historial por sesión, permitiendo preguntas de seguimiento del tipo *"explícame el segundo punto"* o *"¿y cómo se relaciona con lo anterior?"*.

4. **Evaluación formativa, no sumativa**  
   Los quizzes incluyen explicación de la respuesta correcta, orientados al **aprendizaje por error** y no a calificar.

5. **Multimodalidad**  
   Texto escrito + audio hablado cubren distintos estilos de estudio (lectores vs. oyentes).

### Sugerencias de uso docente

- Crear un cuaderno por asignatura o unidad temática.
- Subir el temario + apuntes de clase + grabación de la sesión.
- Pedir al tutor: *"Resume las ideas principales"*, *"¿Qué preguntas de examen podrían salir?"*.
- Generar un quiz antes del examen para detectar lagunas.
- Revisar el panel de **contexto recuperado** para verificar que las respuestas provienen del material correcto.

---

## Arquitectura técnica

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                     │
│  Cuadernos · Fuentes · Chat · Studio (Quiz) · Grabación mic │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST /api
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  sessions · documents · audio · chat · quiz                │
├──────────────┬───────────────┬──────────────┬───────────────┤
│  SQLite      │  ChromaDB     │  LangGraph   │ faster-whisper│
│  (sesiones,  │  (vectores    │  retrieve →  │  (STT local)  │
│   mensajes)  │   por sesión) │  generate    │               │
└──────────────┴───────────────┴──────────────┴───────────────┘
                           │
                    OpenAI API
              (gpt-4o-mini + embeddings)
```

### Estructura del repositorio

```
academic_tutor/
├── backend/                    # API Python
│   ├── app/
│   │   ├── api/routes/         # REST: sessions, documents, audio, chat, quiz
│   │   ├── db/                 # SQLAlchemy async + SQLite
│   │   ├── graph/              # LangGraph: retrieve → generate
│   │   └── services/           # RAG, STT, quiz, document_loader
│   ├── requirements.txt
│   └── README.md
└── frontend/                   # UI Next.js
    ├── src/
    │   ├── app/                # Páginas (home + workspace por sesión)
    │   ├── components/         # chat, materials, studio, session
    │   └── lib/api.ts          # Cliente HTTP
    ├── package.json
    └── README.md
```

### Flujo RAG (backend)

1. Documento o transcripción → división en chunks (800 tokens, solapamiento 150).
2. Embeddings OpenAI (`text-embedding-3-small`) → colección Chroma aislada por `session_id`.
3. En el chat, LangGraph recupera los 6 fragmentos más similares y el LLM responde con ese contexto + historial.

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/sessions` | Crear cuaderno |
| `GET` | `/api/sessions` | Listar cuadernos |
| `POST` | `/api/sessions/{id}/documents/upload` | Subir PDF/TXT/DOCX/MD |
| `POST` | `/api/sessions/{id}/audio/transcribe` | Audio → STT → indexación |
| `POST` | `/api/sessions/{id}/chat` | Mensaje al tutor |
| `POST` | `/api/sessions/{id}/quiz/generate` | Generar mini quiz |

Documentación interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Evaluación de calidad (SQA)

### Fortalezas identificadas

| Área | Observación | Impacto |
|------|-------------|---------|
| **Arquitectura** | Separación clara frontend/backend con contratos REST tipados | Mantenibilidad alta |
| **Aislamiento de datos** | Colecciones Chroma y uploads por sesión | Privacidad entre cuadernos |
| **Prompt engineering** | Reglas pedagógicas explícitas en el system prompt del tutor | Respuestas consistentes y estructuradas |
| **Transparencia RAG** | `context_preview` visible en la UI tras cada respuesta | Trazabilidad de fuentes |
| **Configurabilidad** | Parámetros RAG, Whisper y modelos vía `.env` | Adaptable a distintos entornos |
| **UX defensiva** | Mensajes de error orientados al usuario en `api.ts` | Mejor experiencia ante fallos de backend |
| **Persistencia** | SQLite + Chroma persistente; datos en `backend/data/` | Sesiones recuperables entre reinicios |

### Riesgos y brechas de calidad

| Riesgo | Severidad | Detalle |
|--------|-----------|---------|
| **Sin tests automatizados** | Alta | No hay unit tests, integration tests ni e2e. Regresiones no detectables en CI. |
| **Sin pipeline CI/CD** | Alta | No existe `.github/workflows` ni linting automatizado en backend. |
| **Dependencia externa crítica** | Media | OpenAI API requerida para chat, embeddings y quizzes. Sin fallback offline. |
| **Alucinaciones residuales** | Media | Aunque el prompt prohíbe inventar citas, no hay validación post-generación. |
| **STT en CPU** | Media | Primera transcripción lenta (~minutos). Modelo Whisper descargado bajo demanda. |
| **Sin autenticación** | Media | Cualquier usuario local accede a todas las sesiones. Aceptable en MVP local, no en producción. |
| **Manejo de errores básico** | Baja | Uso de `alert()` en frontend; sin toast/retry pattern. |
| **Quiz sin persistencia** | Baja | Los quizzes generados no se guardan en BD; se pierden al recargar. |

### Matriz de pruebas recomendada

#### Funcionales (prioridad alta)

- [ ] Crear, renombrar, cambiar color y eliminar cuaderno
- [ ] Subir PDF, TXT, DOCX y verificar indexación (`chunks_indexed > 0`)
- [ ] Grabar audio desde micrófono y verificar transcripción
- [ ] Chat con material indexado → respuesta con citas y contexto visible
- [ ] Chat sin material → mensaje honesto de falta de contexto
- [ ] Generar quiz con y sin tema específico
- [ ] Responder quiz y verificar explicaciones

#### No funcionales

- [ ] Tiempo de respuesta del chat (< 15 s con material moderado)
- [ ] Tiempo de STT en CPU vs GPU
- [ ] Comportamiento con API key inválida o ausente
- [ ] CORS con frontend en puerto distinto
- [ ] Sesión con documento7MB+ (límites de upload)

#### Regresión RAG

- [ ] Pregunta cuyo contenido está solo en transcripción de audio
- [ ] Pregunta cuyo contenido está solo en PDF
- [ ] Pregunta fuera del material → debe indicar que no puede responder

### Criterios de aceptación sugeridos (Definition of Done)

1. El tutor **no inventa** fuentes que no aparecen en el contexto recuperado.
2. Cada cuaderno mantiene **aislamiento** de vectores y archivos.
3. El historial de chat persiste tras recargar la página.
4. El quiz contiene entre 5 y 8 preguntas con una sola respuesta correcta y explicación.
5. La UI funciona en Chrome/Edge en `localhost` con backend activo.

---

## Inicio rápido

### Requisitos previos

- **Node.js** 18+ y npm
- **Python** 3.11 o 3.12
- **OpenAI API Key** (LLM + embeddings)
- (Opcional) GPU/CUDA para STT más rápido

### Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows — cp .env.example .env en Unix
```

Edita `backend/.env`:

```env
OPENAI_API_KEY=sk-...
```

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env.local   # Windows — cp en Unix
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

| Variable | Ubicación | Descripción |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | `backend/.env` | Clave para chat y embeddings (**obligatoria**) |
| `OPENAI_CHAT_MODEL` | `backend/.env` | Modelo de chat (default: `gpt-4o-mini`) |
| `WHISPER_MODEL_SIZE` | `backend/.env` | Modelo STT local (`base`, `small`, `tiny`…) |
| `CORS_ORIGINS` | `backend/.env` | Origen del frontend |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | URL base de la API |

Detalle completo en [`backend/README.md`](backend/README.md) y [`frontend/README.md`](frontend/README.md).

---

## Roadmap pedagógico-técnico

| Funcionalidad | Estado | Valor pedagógico |
|---------------|--------|------------------|
| Mini quiz | ✅ Disponible | Evaluación formativa |
| Resumen guía | 🔜 Próximamente | Síntesis del cuaderno completo |
| Mapa de ideas | 🔜 Próximamente | Visualización de relaciones conceptuales |
| Tests automatizados | ❌ Pendiente | Garantía de calidad y regresión |
| Autenticación multi-usuario | ❌ Pendiente | Uso en aula con cuentas individuales |
| Persistencia de quizzes | ❌ Pendiente | Seguimiento del progreso del alumno |

---

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, react-markdown, Web Audio API |
| **Backend** | FastAPI, LangChain, LangGraph, ChromaDB, OpenAI, faster-whisper |
| **Persistencia** | SQLite (sesiones/mensajes), ChromaDB (vectores), disco (uploads) |

---

## Notas operativas

- La primera transcripción de audio descarga el modelo Whisper; puede tardar varios minutos.
- Sin material indexado, el tutor indicará que falta contexto.
- Los datos locales se guardan en `backend/data/` (no versionado).
- La grabación de audio requiere permiso de micrófono (HTTPS o `localhost`).

---

## Licencia

Proyecto académico — Grupo 1.
