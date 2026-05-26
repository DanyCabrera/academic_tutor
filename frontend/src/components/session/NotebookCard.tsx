"use client";

import Link from "next/link";
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
  const theme = getNotebookTheme(session.color);

  return (
    <article
      className={clsx(
        "group relative flex min-h-[190px] flex-col rounded-[1.35rem] border bg-gradient-to-br p-5 transition duration-300",
        "hover:-translate-y-1 hover:shadow-card",
        theme.gradient,
        theme.border,
        theme.glow
      )}
    >
      <Link
        href={`/session/${session.id}`}
        className="absolute inset-0 z-0 rounded-[1.35rem]"
        aria-label={`Abrir ${session.title}`}
      />

      <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-white/0 via-white/60 to-white/0 opacity-70" />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur-sm",
            theme.iconBg
          )}
        >
          <FileText className="h-5 w-5" />
        </div>
        <NotebookMenu
          sessionId={session.id}
          title={session.title}
          color={session.color}
          variant="card"
          onColorChange={(c) => onColorChange(session.id, c)}
          onDelete={() => onDelete(session.id)}
        />
      </div>

      <div className="relative z-10 mt-auto pt-8">
        <div className="pointer-events-auto">
          <EditableNotebookTitle
            sessionId={session.id}
            title={session.title}
            variant="card"
            onSaved={(title) => onRenamed(session.id, title)}
          />
        </div>
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
              "inline-flex items-center gap-1 rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
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
