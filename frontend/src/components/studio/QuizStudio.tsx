"use client";

import { useState } from "react";
import { Eye, HelpCircle, RotateCcw } from "lucide-react";
import type { Quiz } from "@/lib/api";
import { api } from "@/lib/api";
import { QuizModal } from "@/components/quiz/QuizModal";

type Props = {
  sessionId: string;
};

export function QuizStudio({ sessionId }: Props) {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = quiz?.questions ?? [];
  const total = questions.length;

  async function generate() {
    setLoading(true);
    setShowSummary(false);
    setAnswers({});
    setCurrentIndex(0);
    setFlipped(false);
    setModalOpen(false);
    try {
      const data = await api.generateQuiz(sessionId, topic, 6);
      setQuiz(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al generar quiz");
    } finally {
      setLoading(false);
    }
  }

  function resetProgress() {
    setAnswers({});
    setCurrentIndex(0);
    setFlipped(false);
    setShowSummary(false);
  }

  const score = questions.filter(
    (q) => answers[q.id] === q.correct_index
  ).length;

  return (
    <div className="mt-2 w-full space-y-3 border-t border-line/80 pt-3">
      <input
        className="input-field !rounded-xl !py-2.5 text-xs"
        placeholder="Tema opcional (ej. capítulo 3…)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <button
        type="button"
        className="btn-primary w-full !py-2 text-xs"
        disabled={loading}
        onClick={generate}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        {loading ? "Generando…" : "Generar quiz"}
      </button>

      {quiz && !loading && (
        <div className="space-y-2 rounded-xl bg-white/80 p-3">
          <p className="truncate text-sm font-medium text-ink">{quiz.title}</p>
          <p className="text-xs text-muted">{total} tarjetas</p>
          <button
            type="button"
            className="btn-primary w-full !py-2 text-xs"
            onClick={() => {
              resetProgress();
              setModalOpen(true);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Abrir tarjetas
          </button>
          <button
            type="button"
            className="btn-ghost w-full !py-1.5 text-xs"
            onClick={() => {
              setQuiz(null);
              resetProgress();
              setModalOpen(false);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Generar otro
          </button>
        </div>
      )}

      {quiz && (
        <QuizModal
          quiz={quiz}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          answers={answers}
          onAnswer={(questionId, optionIndex) => {
            setAnswers((a) => ({ ...a, [questionId]: optionIndex }));
            setFlipped(false);
          }}
          currentIndex={currentIndex}
          onIndexChange={(index) => {
            setCurrentIndex(index);
            setFlipped(false);
          }}
          flipped={flipped}
          onFlipToggle={() => setFlipped((f) => !f)}
          showSummary={showSummary}
          onShowSummary={() => setShowSummary(true)}
          onReset={resetProgress}
          score={score}
        />
      )}
    </div>
  );
}
