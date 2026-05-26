"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { Message } from "@/lib/api";
import { api } from "@/lib/api";
import { MessageContent } from "./MessageContent";

const SUGGESTIONS = [
  "Resume las ideas principales de mis fuentes",
  "Explícame el concepto más importante",
  "¿Qué preguntas de examen podrían salir?",
  "Compara los temas de mis documentos",
];

type Props = {
  sessionId: string;
  initialMessages: Message[];
  onMessagesChange: () => void;
  hasSources?: boolean;
};

export function ChatPanel({
  sessionId,
  initialMessages,
  onMessagesChange,
  hasSources = false,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextPreview, setContextPreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setInput("");
    setLoading(true);
    setContextPreview(null);

    try {
      const res = await api.chat(sessionId, text);
      setContextPreview(res.context_preview || null);
      onMessagesChange();
      const updated = await api.getMessages(sessionId);
      setMessages(updated);
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      alert(e instanceof Error ? e.message : "Error en el chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="panel-header flex items-center gap-2 bg-surface/80">
        <Sparkles className="h-4 w-4 text-accent" />
        <div>
          <h2 className="panel-title">Chat</h2>
          <p className="panel-subtitle">Pregunta sobre tus fuentes indexadas</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center md:py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-normal text-ink">
                {hasSources
                  ? "Pregunta sobre tu cuaderno"
                  : "Añade fuentes para empezar"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted">
                {hasSources
                  ? "El tutor responde usando el contenido que subiste. Prueba una sugerencia:"
                  : "Sube documentos o audio en el panel Fuentes. Luego podrás chatear aquí."}
              </p>
              {hasSources && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => send(s)}
                      disabled={loading}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              {msg.role === "assistant" && (
                <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  msg.role === "user"
                    ? "max-w-[85%] rounded-3xl rounded-br-md bg-accent px-5 py-3 text-sm text-white"
                    : "max-w-[90%] rounded-3xl rounded-bl-md border border-line bg-surface px-5 py-4 text-sm shadow-soft"
                }
              >
                <MessageContent
                  content={msg.content}
                  variant={msg.role === "user" ? "user" : "assistant"}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-muted">
                <Sparkles className="h-4 w-4 animate-pulse text-accent" />
              </div>
              <div className="rounded-3xl border border-line bg-surface px-5 py-3 text-sm text-muted">
                El tutor está elaborando la respuesta…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {contextPreview && (
        <details className="mx-4 mb-2 rounded-xl border border-line bg-surface text-xs md:mx-8">
          <summary className="cursor-pointer px-4 py-2.5 font-medium text-muted">
            Citas del contexto (RAG)
          </summary>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap px-4 pb-3 text-muted">
            {contextPreview}
          </pre>
        </details>
      )}

      <form
        className="shrink-0 border-t border-line-strong bg-surface px-4 py-4 md:px-8"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            className="input-field flex-1 !rounded-full"
            placeholder={
              hasSources
                ? "Pregunta sobre tus fuentes…"
                : "Añade fuentes para chatear…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary !h-12 !w-12 shrink-0 !rounded-full !p-0"
            disabled={loading || !input.trim()}
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
