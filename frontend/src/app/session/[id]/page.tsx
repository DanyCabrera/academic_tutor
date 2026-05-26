"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NotebookShell } from "@/components/layout/NotebookShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SourcesPanel } from "@/components/materials/SourcesPanel";
import { StudioPanel } from "@/components/studio/StudioPanel";
import {
  api,
  type Material,
  type Message,
  type Session,
} from "@/lib/api";
import type { NotebookColorKey } from "@/lib/notebook-colors";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const refresh = useCallback(async () => {
    const [sess, msgs, mats] = await Promise.all([
      api.getSession(sessionId),
      api.getMessages(sessionId),
      api.getMaterials(sessionId),
    ]);
    setSession(sess);
    setMessages(msgs);
    setMaterials(mats);
  }, [sessionId]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas text-sm text-muted">
        Cargando cuaderno…
      </div>
    );
  }

  const subtitle = `${materials.length} fuente${materials.length === 1 ? "" : "s"} · actualizado ${new Date(session.updated_at).toLocaleDateString("es")}`;

  return (
    <NotebookShell
      title={session.title}
      subtitle={subtitle}
      backHref="/"
      sessionId={session.id}
      color={session.color}
      onTitleSaved={(title) =>
        setSession((s) => (s ? { ...s, title } : s))
      }
      onColorChange={(color: NotebookColorKey) =>
        setSession((s) => (s ? { ...s, color } : s))
      }
      onDelete={() => router.push("/")}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="panel-column max-h-[38vh] w-full shrink-0 border-b lg:max-h-none lg:w-[300px] lg:border-b-0 lg:border-r">
          <SourcesPanel
            sessionId={sessionId}
            materials={materials}
            onRefresh={refresh}
          />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">
          <ChatPanel
            sessionId={sessionId}
            initialMessages={messages}
            onMessagesChange={refresh}
            hasSources={materials.length > 0}
          />
        </section>

        <aside className="panel-column max-h-[42vh] w-full shrink-0 border-t lg:max-h-none lg:w-[320px] lg:border-l">
          <StudioPanel sessionId={sessionId} />
        </aside>
      </div>
    </NotebookShell>
  );
}
