# Frontend — Academic Tutor

Interfaz web en **Next.js 15** con diseño formal, paleta de colores mates y experiencia inspirada en NotebookLM (materiales, chat, quizzes).

---

## Requisitos

- Node.js **18+**
- Backend corriendo en `http://localhost:8000` (ver [`../backend/README.md`](../backend/README.md))

---

## Instalación

Desde la carpeta `frontend/`:

```bash
npm install
```

**Windows:**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**

```bash
cp .env.example .env.local
```

Contenido de `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |
| `npm run lint` | ESLint (Next.js) |

---

## Estructura

```
src/
├── app/
│   ├── layout.tsx          # Tipografías y layout global
│   ├── page.tsx            # Inicio + listado de sesiones
│   ├── globals.css         # Tokens y utilidades UI
│   └── session/[id]/page.tsx  # Workspace de estudio
├── components/
│   ├── layout/             # Header, Sidebar
│   ├── chat/               # ChatPanel
│   ├── materials/          # Upload, grabación, listado
│   └── quiz/               # QuizPanel
└── lib/
    └── api.ts              # Cliente REST hacia el backend
```

---

## Diseño UI/UX

- **Paleta mate:** fondo `#f4f3f0`, acento `#4a5d6c`, texto `#2c2a26`
- Tipografía: **Inter** (UI) + **Source Serif 4** (títulos)
- Componentes con bordes suaves, sombras ligeras y jerarquía clara
- Layout de tres zonas en sesión: sidebar · chat · materiales/quiz

---

## Funcionalidades de la UI

1. **Sesiones** — crear y navegar historial en sidebar
2. **Materiales** — subir PDF/TXT/DOCX o audio; grabar desde el micrófono
3. **Transcripción** — vista previa del último STT indexado
4. **Chat** — burbujas usuario/asistente + panel de contexto RAG
5. **Quiz** — generación, selección de respuestas y explicaciones

---

## Permisos del navegador

La **grabación de audio** requiere permiso de micrófono (HTTPS o `localhost`).

Formatos recomendados para subida: `.webm`, `.mp3`, `.wav`, `.m4a`.

---

## Producción

```bash
npm run build
npm run start
```

Configura `NEXT_PUBLIC_API_URL` apuntando al backend desplegado.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Error de red al chatear | Verifica que el backend esté en el puerto 8000 |
| `Failed to fetch` | Revisa `NEXT_PUBLIC_API_URL` y CORS en el backend |
| Micrófono no funciona | Usa Chrome/Edge en localhost y concede permisos |
| Quiz vacío o error | Indexa material antes de generar el quiz |
