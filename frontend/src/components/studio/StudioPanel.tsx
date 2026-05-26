"use client";

import { HelpCircle, Layers, Sparkles } from "lucide-react";
import { QuizStudio } from "./QuizStudio";

type Props = {
  sessionId: string;
};

export function StudioPanel({ sessionId }: Props) {
  return (
    <>
      <div className="panel-header">
        <h2 className="panel-title">Studio</h2>
        <p className="panel-subtitle">
          Herramientas generadas desde tus fuentes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          Próximamente
        </p>
        <div className="mb-6 grid gap-2">
          <div className="studio-card cursor-default opacity-55">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Resumen guía</p>
              <p className="text-xs text-muted">Síntesis del cuaderno</p>
            </div>
          </div>
          <div className="studio-card cursor-default opacity-55">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Mapa de ideas</p>
              <p className="text-xs text-muted">Visualización de conceptos</p>
            </div>
          </div>
        </div>

        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
          Disponible
        </p>

        <div className="rounded-2xl border border-accent/20 bg-accent-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Mini quiz</p>
              <p className="text-xs text-muted">
                Tarjetas de práctica desde tu material
              </p>
            </div>
          </div>
          <QuizStudio sessionId={sessionId} />
        </div>
      </div>
    </>
  );
}
