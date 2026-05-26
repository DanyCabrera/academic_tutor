"use client";

import { useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FlipHorizontal2,
  X,
} from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/api";
import clsx from "clsx";

type Props = {
  quiz: Quiz;
  open: boolean;
  onClose: () => void;
  answers: Record<number, number>;
  onAnswer: (questionId: number, optionIndex: number) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  flipped: boolean;
  onFlipToggle: () => void;
  showSummary: boolean;
  onShowSummary: () => void;
  onReset: () => void;
  score: number;
};

export function QuizModal({
  quiz,
  open,
  onClose,
  answers,
  onAnswer,
  currentIndex,
  onIndexChange,
  flipped,
  onFlipToggle,
  showSummary,
  onShowSummary,
  onReset,
  score,
}: Props) {
  const questions = quiz.questions;
  const current = questions[currentIndex];
  const total = questions.length;
  const hasAnswer =
    current !== undefined && answers[current.id] !== undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !current) return null;

  function goTo(index: number) {
    onIndexChange(index);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-card">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="min-w-0 pr-4">
            <h3
              id="quiz-modal-title"
              className="truncate text-base font-medium text-ink"
            >
              {quiz.title}
            </h3>
            {!showSummary && (
              <p className="text-xs text-muted">
                Tarjeta {currentIndex + 1} de {total}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="quiz-nav-btn"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {showSummary ? (
            <SummaryView
              score={score}
              total={total}
              onReset={onReset}
              onClose={onClose}
            />
          ) : (
            <>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / total) * 100}%`,
                  }}
                />
              </div>

              <Flashcard
                question={current}
                flipped={flipped}
                selectedIndex={answers[current.id]}
                onSelect={(idx) => onAnswer(current.id, idx)}
              />
            </>
          )}
        </div>

        {/* Footer fijo — controles fuera de la tarjeta */}
        {!showSummary && (
          <div className="quiz-modal-footer space-y-3">
            <p className="text-center text-xs text-muted">
              {hasAnswer
                ? "Pulsa Voltear para ver la respuesta correcta"
                : "Selecciona una opción en la tarjeta para continuar"}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="quiz-nav-btn"
                disabled={currentIndex === 0}
                onClick={() => goTo(currentIndex - 1)}
                aria-label="Tarjeta anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="quiz-flip-btn"
                disabled={!hasAnswer}
                onClick={onFlipToggle}
              >
                <FlipHorizontal2 className="h-4 w-4 shrink-0" />
                {flipped ? "Ver pregunta" : "Voltear tarjeta"}
              </button>

              <button
                type="button"
                className="quiz-nav-btn"
                disabled={currentIndex >= total - 1}
                onClick={() => goTo(currentIndex + 1)}
                aria-label="Siguiente tarjeta"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {currentIndex === total - 1 && (
              <button
                type="button"
                className="btn-primary w-full"
                onClick={onShowSummary}
              >
                Ver resumen ({Object.keys(answers).length}/{total})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Flashcard({
  question,
  flipped,
  selectedIndex,
  onSelect,
}: {
  question: QuizQuestion;
  flipped: boolean;
  selectedIndex: number | undefined;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className={clsx("flip-card", flipped && "flipped")}>
      <div className="flip-card-inner">
        {/* Frente */}
        <div className="flip-card-face flip-card-front">
          <div className="flex flex-col rounded-xl border border-line bg-gradient-to-b from-card to-surface/30 p-5 shadow-soft">
            <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Pregunta
            </span>
            <p className="mb-4 text-base leading-relaxed text-ink">
              {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition",
                    selectedIndex === idx
                      ? "border-accent bg-accent/10 font-medium text-ink ring-1 ring-accent/20"
                      : "border-line bg-card hover:border-accent/40 hover:bg-surface/50"
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-xs font-mono font-medium text-muted">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dorso */}
        <div className="flip-card-face flip-card-back">
          <div className="flex flex-col rounded-xl border border-accent/25 bg-gradient-to-b from-accent/[0.07] to-surface/40 p-5 shadow-soft">
            <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
              Respuesta
            </span>
            {selectedIndex !== undefined ? (
              <>
                <div className="space-y-2">
                  {question.options.map((opt, idx) => {
                    const isCorrect = idx === question.correct_index;
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={clsx(
                          "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
                          isCorrect &&
                            "border-success/50 bg-success/10 font-medium text-ink",
                          isSelected &&
                            !isCorrect &&
                            "border-danger/40 bg-danger/10",
                          !isCorrect &&
                            !isSelected &&
                            "border-line/70 bg-card/60 text-muted"
                        )}
                      >
                        <span className="font-mono text-xs font-medium">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {isCorrect && (
                          <span className="shrink-0 rounded bg-success/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">
                            Correcta
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="shrink-0 rounded bg-danger/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-danger">
                            Tu respuesta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 rounded-lg border border-line/80 bg-card/80 px-3 py-3 text-xs leading-relaxed text-muted">
                  {question.explanation}
                </p>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                Vuelve al frente y elige una opción.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryView({
  score,
  total,
  onReset,
  onClose,
}: {
  score: number;
  total: number;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <p className="text-lg font-medium text-ink">Resumen</p>
      <p className="mt-4 text-4xl font-light text-accent">
        {score} <span className="text-lg text-muted">/ {total}</span>
      </p>
      <p className="mt-1 text-sm text-muted">respuestas correctas</p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button type="button" className="btn-secondary" onClick={onReset}>
          Repasar tarjetas
        </button>
        <button type="button" className="btn-primary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
