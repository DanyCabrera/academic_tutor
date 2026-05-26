const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type Session = {
  id: string;
  title: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export type Material = {
  id: string;
  name: string;
  kind: string;
  created_at: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type Quiz = {
  title: string;
  questions: QuizQuestion[];
};

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    let message =
      typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail ?? err);
    if (res.status === 405) {
      message =
        "El backend no reconoce esta acción. Detén uvicorn (Ctrl+C) y vuelve a iniciarlo desde la carpeta backend con el entorno virtual activado.";
    }
    if (res.status === 404 && message === "Not Found") {
      message =
        "El backend no tiene la función de renombrar. Reinicia el servidor: cd backend → .\\.venv\\Scripts\\Activate.ps1 → uvicorn app.main:app --reload --port 8000";
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  createSession: (title = "Nueva sesión") =>
    request<Session>("/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }),

  listSessions: () => request<Session[]>("/sessions"),

  getSession: (id: string) => request<Session>(`/sessions/${id}`),

  updateSession: (id: string, title: string) =>
    request<Session>(`/sessions/${id}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }),

  updateSessionColor: (id: string, color: string) =>
    request<Session>(`/sessions/${id}/color`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    }),

  deleteSession: async (id: string) => {
    const res = await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      let message =
        typeof err.detail === "string" ? err.detail : "No se pudo eliminar";
      if (res.status === 405) {
        message =
          "El backend no permite eliminar. Reinicia con: cd backend → .\\start.ps1";
      }
      if (res.status === 404 && message === "Not Found") {
        message =
          "El backend no tiene eliminar cuadernos. Reinicia con: cd backend → .\\start.ps1";
      }
      throw new Error(message);
    }
  },

  getMessages: (id: string) => request<Message[]>(`/sessions/${id}/messages`),

  getMaterials: (id: string) => request<Material[]>(`/sessions/${id}/materials`),

  chat: (sessionId: string, message: string) =>
    request<{ reply: string; context_preview: string }>(
      `/sessions/${sessionId}/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      }
    ),

  uploadDocument: async (sessionId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${API_BASE}/sessions/${sessionId}/documents/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? "Error al subir documento");
    }
    return res.json();
  },

  uploadAudio: async (sessionId: string, file: File, blob?: Blob) => {
    const form = new FormData();
    const payload = blob ?? file;
    form.append("file", payload, file.name);
    const res = await fetch(
      `${API_BASE}/sessions/${sessionId}/audio/transcribe`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? "Error al transcribir audio");
    }
    return res.json() as Promise<{
      transcription: string;
      chunks_indexed: number;
      material_id: string;
    }>;
  },

  generateQuiz: (sessionId: string, topic: string, num_questions: number) =>
    request<Quiz>(`/sessions/${sessionId}/quiz/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, num_questions }),
    }),
};
