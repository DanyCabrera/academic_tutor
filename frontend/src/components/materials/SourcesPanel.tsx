"use client";

import { useRef, useState } from "react";
import {
  FileText,
  FileUp,
  Mic,
  Plus,
  Upload,
  Waves,
} from "lucide-react";
import type { Material } from "@/lib/api";
import { api } from "@/lib/api";
import { AudioRecorder } from "./AudioRecorder";
import clsx from "clsx";

type Props = {
  sessionId: string;
  materials: Material[];
  onRefresh: () => void;
};

function sourceIcon(kind: string) {
  return kind === "transcription" ? Mic : FileText;
}

export function SourcesPanel({ sessionId, materials, onRefresh }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [lastTranscription, setLastTranscription] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleDocument(file: File) {
    setLoading(true);
    setError(null);
    try {
      await api.uploadDocument(sessionId, file);
      onRefresh();
      setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setLoading(false);
    }
  }

  async function handleAudio(file: File) {
    setLoading(true);
    setError(null);
    try {
      const result = await api.uploadAudio(sessionId, file);
      setLastTranscription(result.transcription);
      onRefresh();
      setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en audio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="panel-header flex items-center justify-between">
        <div>
          <h2 className="panel-title">Fuentes</h2>
          <p className="panel-subtitle">
            {materials.length === 0
              ? "Añade material para el tutor"
              : `${materials.length} en este cuaderno`}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost !px-2.5 !py-1.5 text-accent"
          onClick={() => setShowAdd((v) => !v)}
          aria-expanded={showAdd}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:inline">Añadir</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {showAdd && (
          <div className="space-y-3 border-b border-line bg-studio/50 p-4">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDocument(f);
                e.target.value = "";
              }}
            />
            <input
              ref={audioRef}
              type="file"
              className="hidden"
              accept="audio/*,.webm,.mp3,.wav,.m4a"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAudio(f);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              className="btn-secondary w-full !rounded-xl"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              <FileUp className="h-4 w-4" />
              Subir documento
            </button>
            <button
              type="button"
              className="btn-secondary w-full !rounded-xl"
              disabled={loading}
              onClick={() => audioRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Subir audio
            </button>

            <AudioRecorder
              disabled={loading}
              onRecorded={async (blob) => {
                setLoading(true);
                setError(null);
                try {
                  const file = new File([blob], "grabacion.webm", {
                    type: "audio/webm",
                  });
                  const result = await api.uploadAudio(sessionId, file, blob);
                  setLastTranscription(result.transcription);
                  onRefresh();
                  setShowAdd(false);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Error al grabar"
                  );
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        )}

        {error && (
          <p className="mx-4 mt-3 rounded-xl border border-danger/20 bg-red-50 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <div className="flex-1 p-3">
          {materials.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-studio px-4 py-10 text-center transition hover:border-accent/50 hover:bg-accent-muted/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Añadir fuente</p>
                <p className="mt-1 text-xs text-muted">
                  PDF, DOCX, TXT o audio
                </p>
              </div>
            </button>
          ) : (
            <ul className="space-y-2">
              {materials.map((m) => {
                const Icon = sourceIcon(m.kind);
                return (
                  <li key={m.id}>
                    <div className="source-chip">
                      <div
                        className={clsx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          m.kind === "transcription"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-accent-muted text-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-muted">
                          {m.kind === "transcription"
                            ? "Transcripción"
                            : "Documento"}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lastTranscription && (
          <div className="shrink-0 border-t border-line p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
              <Waves className="h-3 w-3" />
              Última transcripción
            </p>
            <p className="max-h-24 overflow-y-auto text-xs leading-relaxed text-ink/80">
              {lastTranscription}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
