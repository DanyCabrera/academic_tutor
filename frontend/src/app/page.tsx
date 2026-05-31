"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Mic, Plus, Sparkles } from "lucide-react";
import { NotebookShell } from "@/components/layout/NotebookShell";
import { NotebookCard } from "@/components/session/NotebookCard";
import { api, type Session } from "@/lib/api";
import type { NotebookColorKey } from "@/lib/notebook-colors";

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const list = await api.listSessions();
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleNewSession() {
    setCreating(true);
    try {
      const session = await api.createSession();
      await loadSessions();
      router.push(`/session/${session.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo crear el cuaderno");
    } finally {
      setCreating(false);
    }
  }

  function handleRenamed(sessionId: string, title: string) {
    setSessions((list) =>
      list.map((s) => (s.id === sessionId ? { ...s, title } : s))
    );
  }

  function handleColorChange(sessionId: string, color: NotebookColorKey) {
    setSessions((list) =>
      list.map((s) => (s.id === sessionId ? { ...s, color } : s))
    );
  }

  function handleDelete(sessionId: string) {
    setSessions((list) => list.filter((s) => s.id !== sessionId));
  }

  return (
    <NotebookShell>
      <main className="flex-1 overflow-y-auto">
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-48 rounded-[2rem] bg-gradient-to-b from-accent-muted/90 to-transparent" />

          <header className="relative mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-soft">
              Academic Tutor
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-ink sm:text-4xl">
              Tus cuadernos de estudio
            </h2>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={handleNewSession}
              disabled={creating}
              className="group flex min-h-[190px] flex-col items-center justify-center gap-4 rounded-[1.35rem] border-2 border-dashed border-line-strong bg-surface p-6 text-center transition hover:border-accent/50 hover:bg-accent-muted/50 disabled:opacity-60"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted text-accent transition group-hover:bg-accent group-hover:text-surface">
                <Plus className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  {creating ? "Creando cuaderno…" : "Nuevo cuaderno"}
                </p>
              </div>
            </button>

            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[190px] animate-pulse rounded-[1.35rem] border border-line bg-surface"
                />
              ))}

            {!loading &&
              sessions.map((s) => (
                <NotebookCard
                  key={s.id}
                  session={s}
                  onRenamed={handleRenamed}
                  onColorChange={handleColorChange}
                  onDelete={handleDelete}
                />
              ))}
          </div>

          {!loading && sessions.length === 0 && (
            <section className="mt-14 overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-soft">
              <div className="grid gap-0 sm:grid-cols-3">
                {[
                  {
                    icon: FileText,
                    title: "Añade fuentes",
                    desc: "PDF, DOCX, TXT o MD",
                  },
                  {
                    icon: Mic,
                    title: "Graba o sube audio",
                    desc: "Transcripción automática",
                  },
                  {
                    icon: Sparkles,
                    title: "Pregunta al tutor",
                    desc: "Respuestas con contexto",
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className={`px-8 py-6 ${i > 0 ? "border-t sm:border-l sm:border-t-0 border-line" : ""}`}
                  >
                    <Icon className="h-5 w-5 text-accent" />
                    <p className="mt-3 text-sm font-medium text-ink">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </NotebookShell>
  );
}