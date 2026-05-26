"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Props = {
  disabled?: boolean;
  onRecorded: (blob: Blob) => void;
};

export function AudioRecorder({ disabled, onRecorded }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRef.current?.stop();
    };
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) onRecorded(blob);
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert("No se pudo acceder al micrófono. Verifica permisos del navegador.");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
        <Mic className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Grabar nota de voz</span>
        {recording && (
          <span className="font-mono text-danger">● {mm}:{ss}</span>
        )}
      </div>
      {!recording ? (
        <button
          type="button"
          className="btn-primary !px-3 !py-1.5 text-xs"
          disabled={disabled}
          onClick={start}
        >
          Grabar
        </button>
      ) : (
        <button
          type="button"
          className="rounded-full border border-danger/30 bg-red-50 px-3 py-1.5 text-xs font-medium text-danger"
          onClick={stop}
        >
          <Square className="mr-1 inline h-3 w-3 fill-current" />
          Detener
        </button>
      )}
    </div>
  );
}
