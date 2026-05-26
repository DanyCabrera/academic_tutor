"use client";

import { NotebookTopBar } from "./NotebookTopBar";
import type { NotebookColorKey } from "@/lib/notebook-colors";

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  sessionId?: string;
  color?: string;
  onTitleSaved?: (title: string) => void;
  onColorChange?: (color: NotebookColorKey) => void;
  onDelete?: () => void;
};

export function NotebookShell({
  children,
  title,
  subtitle,
  backHref,
  sessionId,
  color,
  onTitleSaved,
  onColorChange,
  onDelete,
}: Props) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <NotebookTopBar
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        sessionId={sessionId}
        color={color}
        onTitleSaved={onTitleSaved}
        onColorChange={onColorChange}
        onDelete={onDelete}
      />
      {children}
    </div>
  );
}
