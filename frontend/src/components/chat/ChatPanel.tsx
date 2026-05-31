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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) {
      setMessages(initialMessages);
    }
  }, [initialMessages, loading]);

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

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="chat-shell">
      <div className="panel-header gap-3 bg-surface/90">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-muted">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="panel-title">Chat</h2>
          <p className="panel-subtitle">
            {hasSources
              ? "Respuestas basadas en tus fuentes"
              : "Añade material en Fuentes para empezar"}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="chat-thread">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center sm:py-14">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
                <Sparkles className="h-8 w-8 text-accent" aria-hidden />
              </div>
              <h3 className="text-lg font-medium tracking-tight text-ink">
                {hasSources
                  ? "Pregunta sobre tu cuaderno"
                  : "Tu tutor te espera"}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                {hasSources
                  ? "El tutor usa solo el contenido que subiste. Prueba una sugerencia:"
                  : "Sube documentos o audio en el panel Fuentes. Después podrás chatear aquí."}
              </p>
              {hasSources && (
                <div className="mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
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
                msg.role === "user"
                  ? "flex justify-end gap-0"
                  : "flex items-start gap-3"
              }
            >
              {msg.role === "assistant" && (
                <div className="chat-avatar" aria-hidden>
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-assistant"
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
            <div className="flex items-start gap-3">
              <div className="chat-avatar" aria-hidden>
                <Sparkles className="h-4 w-4 animate-pulse text-accent" />
              </div>
              <div className="chat-bubble-loading">
                <span className="sr-only">Generando respuesta</span>
                <span className="inline-flex items-center gap-2 text-muted">
                  Elaborando respuesta
                  <span className="typing-dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>
      </div>

      {contextPreview && (
        <details className="chat-rag-details">
          <summary className="cursor-pointer px-4 py-2.5 font-medium text-muted transition hover:text-ink">
            Citas del contexto (RAG)
          </summary>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap border-t border-line px-4 py-3 text-[11px] leading-relaxed text-muted">
            {contextPreview}
          </pre>
        </details>
      )}

      <form
        className="chat-composer-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="chat-composer-inner">
          <input
            className="chat-composer-input"
            placeholder={
              hasSources
                ? "Escribe tu pregunta…"
                : "Añade fuentes para chatear…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={8000}
            aria-label="Mensaje para el tutor"
          />
          <button
            type="submit"
            className="chat-composer-send"
            disabled={!canSend}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
