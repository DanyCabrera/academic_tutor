"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Palette, Trash2 } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import {
  NOTEBOOK_COLOR_KEYS,
  NOTEBOOK_PALETTE,
  type NotebookColorKey,
} from "@/lib/notebook-colors";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Props = {
  sessionId: string;
  title: string;
  color: string;
  onColorChange: (color: NotebookColorKey) => void;
  onDelete: () => void;
  variant?: "card" | "header";
};

export function NotebookMenu({
  sessionId,
  title,
  color,
  onColorChange,
  onDelete,
  variant = "card",
}: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        btnRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 220;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8
      );
      setMenuStyle({ top: rect.bottom + 6, left });
    }
    setOpen(true);
  }

  async function pickColor(key: NotebookColorKey) {
    if (key === color || savingColor) return;
    setSavingColor(true);
    try {
      const updated = await api.updateSessionColor(sessionId, key);
      onColorChange(updated.color as NotebookColorKey);
      setOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo cambiar el color");
    } finally {
      setSavingColor(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteSession(sessionId);
      setConfirmDelete(false);
      setOpen(false);
      onDelete();
    } catch (e) {
      alert(e instanceof Error ? e.message : "No se pudo eliminar el cuaderno");
    } finally {
      setDeleting(false);
    }
  }

  const dropdown =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[150] min-w-[220px] overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-card"
            style={{ top: menuStyle.top, left: menuStyle.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
                <Palette className="h-3.5 w-3.5" />
                Color del cuaderno
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {NOTEBOOK_COLOR_KEYS.map((key) => {
                  const theme = NOTEBOOK_PALETTE[key];
                  const active = color === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={theme.label}
                      disabled={savingColor}
                      className={clsx(
                        "flex h-9 w-9 items-center justify-center rounded-full transition",
                        active && `ring-2 ring-offset-2 ${theme.ring}`
                      )}
                      onClick={() => pickColor(key)}
                    >
                      <span
                        className={clsx(
                          "h-6 w-6 rounded-full shadow-sm",
                          theme.dot
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-danger transition hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar cuaderno
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={clsx(
          "relative z-20 inline-flex items-center justify-center rounded-full text-muted transition hover:bg-white/70 hover:text-ink",
          variant === "card"
            ? "pointer-events-auto h-8 w-8 bg-white/50 backdrop-blur-sm"
            : "btn-ghost h-9 w-9"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        }}
        aria-label="Opciones del cuaderno"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {dropdown}

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar cuaderno"
        message={`¿Eliminar "${title}"? Se borrarán fuentes, chat e índice RAG. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
