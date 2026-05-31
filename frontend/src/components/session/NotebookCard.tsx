"use client";

import { useRouter } from "next/navigation";
import { BookOpen, FileText } from "lucide-react";
import clsx from "clsx";
import type { Session } from "@/lib/api";
import {
  getNotebookTheme,
  type NotebookColorKey,
} from "@/lib/notebook-colors";
import { EditableNotebookTitle } from "./EditableNotebookTitle";
import { NotebookMenu } from "./NotebookMenu";

type Props = {
  session: Session;
  onRenamed: (sessionId: string, title: string) => void;
  onColorChange: (sessionId: string, color: NotebookColorKey) => void;
  onDelete: (sessionId: string) => void;
};

export function NotebookCard({
  session,
  onRenamed,
  onColorChange,
  onDelete,
}: Props) {
  const router = useRouter();
  const theme = getNotebookTheme(session.color);

  function openNotebook() {
    router.push(`/session/${session.id}`);
  }

  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-card-action]")) return;
    openNotebook();
  }

  function handleCardKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-card-action]")) return;
    e.preventDefault();
    openNotebook();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={clsx(
        "group relative flex min-h-[190px] cursor-pointer flex-col rounded-[1.35rem] border bg-gradient-to-br p-5 transition duration-300",
        "hover:-translate-y-1 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        theme.gradient,
        theme.border,
        theme.glow
      )}
      aria-label={`Abrir cuaderno ${session.title}`}
    >
      <div className="absolute left-0 top-0 h-px w-full bg-surface/40" aria-hidden />

      <div className="flex items-start justify-between gap-2">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            theme.iconBg
          )}
        >
          <FileText className="h-5 w-5" />
        </div>
        <div data-card-action>
          <NotebookMenu
            sessionId={session.id}
            title={session.title}
            color={session.color}
            variant="card"
            onColorChange={(c) => onColorChange(session.id, c)}
            onDelete={() => onDelete(session.id)}
          />
        </div>
      </div>

      <div className="mt-auto flex flex-col pt-8">
        <EditableNotebookTitle
          sessionId={session.id}
          title={session.title}
          variant="card"
          onSaved={(title) => onRenamed(session.id, title)}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted/90">
            {new Date(session.updated_at).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full bg-surface/70 px-2 py-0.5 text-[10px] font-medium",
              theme.accent
            )}
          >
            <BookOpen className="h-3 w-3" />
            Cuaderno
          </span>
        </div>
      </div>
    </article>
  );
}
