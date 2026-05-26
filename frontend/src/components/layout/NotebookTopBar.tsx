"use client";

import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import clsx from "clsx";
import { EditableNotebookTitle } from "@/components/session/EditableNotebookTitle";
import { NotebookMenu } from "@/components/session/NotebookMenu";
import { getNotebookTheme, type NotebookColorKey } from "@/lib/notebook-colors";

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  sessionId?: string;
  color?: string;
  onTitleSaved?: (title: string) => void;
  onColorChange?: (color: NotebookColorKey) => void;
  onDelete?: () => void;
};

export function NotebookTopBar({
  title,
  subtitle,
  backHref,
  sessionId,
  color = "blue",
  onTitleSaved,
  onColorChange,
  onDelete,
}: Props) {
  const canEdit = Boolean(sessionId && title && onTitleSaved);
  const theme = getNotebookTheme(color);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line-strong bg-surface/95 px-4 backdrop-blur-sm">
      {backHref ? (
        <Link
          href={backHref}
          className="btn-ghost -ml-1 shrink-0"
          aria-label="Volver a cuadernos"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Cuadernos</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted text-accent">
            <BookMarked className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-ink">Academic Tutor</span>
        </div>
      )}

      {title && (
        <>
          <span className="hidden text-line-strong sm:inline">/</span>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", theme.dot)}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              {canEdit ? (
                <EditableNotebookTitle
                  sessionId={sessionId!}
                  title={title}
                  variant="header"
                  onSaved={onTitleSaved!}
                />
              ) : (
                <h1 className="truncate text-sm font-medium text-ink">{title}</h1>
              )}
              {subtitle && (
                <p className="truncate text-xs text-muted">{subtitle}</p>
              )}
            </div>
          </div>
          {canEdit && onColorChange && onDelete && (
            <NotebookMenu
              sessionId={sessionId!}
              title={title}
              color={color}
              variant="header"
              onColorChange={onColorChange}
              onDelete={onDelete}
            />
          )}
        </>
      )}
    </header>
  );
}
