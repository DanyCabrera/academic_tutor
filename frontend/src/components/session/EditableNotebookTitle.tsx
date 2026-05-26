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
  /** Barra superior compacta vs. tarjeta en inicio */
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

  if (editing) {
    return (
      <form
        className={clsx("flex min-w-0 items-center gap-1.5", className)}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={MAX_TITLE_LENGTH}
          disabled={saving}
          className={clsx(
            "min-w-0 flex-1 rounded-lg border border-accent bg-surface px-2.5 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/25",
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
          aria-label="Nombre del cuaderno"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          className="btn-ghost !p-1.5 text-accent"
          aria-label="Guardar nombre"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={saving}
          className="btn-ghost !p-1.5"
          onClick={cancel}
          aria-label="Cancelar"
        >
          <X className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <div
      className={clsx(
        "group flex min-w-0 items-center gap-1",
        className
      )}
    >
      <span
        className={clsx(
          "min-w-0 truncate font-medium text-ink",
          variant === "header" ? "text-sm" : "text-base"
        )}
      >
        {title}
      </span>
      <button
        type="button"
        className={clsx(
          "btn-ghost shrink-0 !p-1 text-muted opacity-0 transition group-hover:opacity-100 focus:opacity-100",
          variant === "card" && "opacity-100"
        )}
        onClick={() => setEditing(true)}
        aria-label="Renombrar cuaderno"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
