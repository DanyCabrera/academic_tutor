"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

const MAX_TITLE_LENGTH = 200;

type Props = {
  sessionId: string;
  title: string;
  onSaved: (title: string) => void;
  className?: string;
  inputClassName?: string;
  variant?: "header" | "card";
};

export function EditableNotebookTitle({
  sessionId,
  title,
  onSaved,
  className,
  inputClassName,
  variant = "header",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function save() {
    const next = draft.trim();
    if (!next) {
      setDraft(title);
      setEditing(false);
      return;
    }
    if (next === title) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateSession(sessionId, next);
      onSaved(updated.title);
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo guardar el nombre");
      setDraft(title);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(title);
    setEditing(false);
  }

  function stopBubble(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  if (editing) {
    return (
      <form
        data-card-action
        className={clsx(
          "flex min-w-0 items-center gap-1.5",
          variant === "card" && "w-full",
          className
        )}
        onSubmit={(e) => {
          e.preventDefault();
          stopBubble(e);
          save();
        }}
        onClick={stopBubble}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={MAX_TITLE_LENGTH}
          disabled={saving}
          className={clsx(
            "min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-sm text-ink focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20",
            variant === "header" ? "max-w-md" : "w-full",
            inputClassName
          )}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          onClick={stopBubble}
          aria-label="Nombre del cuaderno"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          className="btn-ghost shrink-0 !p-1.5 text-accent"
          aria-label="Guardar nombre"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={saving}
          className="btn-ghost shrink-0 !p-1.5"
          onClick={(e) => {
            stopBubble(e);
            cancel();
          }}
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
      </form>
    );
  }

  if (variant === "card") {
    return (
      <div className={clsx("min-w-0", className)}>
        <p className="truncate text-base font-medium text-ink">{title}</p>
        <button
          type="button"
          data-card-action
          className="mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs text-muted transition hover:bg-surface/80 hover:text-accent"
          onClick={(e) => {
            stopBubble(e);
            setEditing(true);
          }}
          aria-label="Renombrar cuaderno"
        >
          <Pencil className="h-3.5 w-3.5" />
          Renombrar
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "group/title flex min-w-0 items-center gap-1",
        className
      )}
    >
      <button
        type="button"
        className="min-w-0 truncate text-left text-sm font-medium text-ink transition hover:text-accent-deep"
        onClick={() => setEditing(true)}
        aria-label={`Renombrar cuaderno ${title}`}
      >
        {title}
      </button>
      <button
        type="button"
        className="btn-ghost shrink-0 !p-1 text-muted opacity-70 transition hover:opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100"
        onClick={() => setEditing(true)}
        aria-label="Renombrar cuaderno"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
