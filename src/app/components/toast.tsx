"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TIMEOUT_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPortalRoot(document.getElementById("modal-root") ?? document.body);
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
    const handle = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeoutsRef.current.delete(handle);
    }, TIMEOUT_MS);
    timeoutsRef.current.add(handle);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show(m, "success"),
      error: (m) => show(m, "error"),
      info: (m) => show(m, "info"),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalRoot &&
        createPortal(
          <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                kind={t.kind}
                message={t.message}
                onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              />
            ))}
          </div>,
          portalRoot
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({
  kind,
  message,
  onDismiss,
}: {
  kind: ToastKind;
  message: string;
  onDismiss: () => void;
}) {
  const styles =
    kind === "success"
      ? "bg-green-500 text-white border-green-600"
      : kind === "error"
      ? "bg-red-500 text-white border-red-600"
      : "bg-card text-foreground border-border";
  const icon = kind === "success" ? "✓" : kind === "error" ? "✗" : "ℹ";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 min-w-[240px] max-w-[380px] px-4 py-2.5 rounded-xl border shadow-lg text-sm animate-in fade-in slide-in-from-top-2 ${styles}`}
    >
      <span className="font-bold" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-current opacity-70 hover:opacity-100 text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-black/10"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}

const FALLBACK_TOAST: ToastContextValue = {
  show: (m) => console.info("[toast fallback]", m),
  success: (m) => console.info("[toast fallback success]", m),
  error: (m) => console.error("[toast fallback error]", m),
  info: (m) => console.info("[toast fallback info]", m),
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  return ctx ?? FALLBACK_TOAST;
}
