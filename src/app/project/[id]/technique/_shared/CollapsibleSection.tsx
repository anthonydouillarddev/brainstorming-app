"use client";

import { useEffect, useState, type ReactNode } from "react";
import BlockStatus from "./BlockStatus";

// Wrapper collapsible utilisé par tous les blocs des chapitres Technique.
// Header cliquable (emoji + titre + description + status + chevron) + content.
// Persiste l'état open/closed en localStorage via `storageKey`.
// Auto-collapse quand 100% rempli si `autoCollapseWhenFull` activé.

export default function CollapsibleSection({
  emoji,
  title,
  description,
  filled,
  total,
  storageKey,
  defaultOpen = true,
  autoCollapseWhenFull = false,
  children,
}: {
  emoji: string;
  title: string;
  description?: string;
  filled?: number;
  total?: number;
  storageKey: string;
  defaultOpen?: boolean;
  autoCollapseWhenFull?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "open" || saved === "closed") {
      setOpen(saved === "open");
    } else if (
      autoCollapseWhenFull &&
      typeof filled === "number" &&
      typeof total === "number" &&
      total > 0 &&
      filled >= total
    ) {
      setOpen(false);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function toggle() {
    const next = !open;
    setOpen(next);
    window.localStorage.setItem(storageKey, next ? "open" : "closed");
  }

  const hasStatus = typeof filled === "number" && typeof total === "number";

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-background/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span aria-hidden>{emoji}</span>
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasStatus && <BlockStatus filled={filled!} total={total!} />}
          <span
            aria-hidden
            className={`text-xs text-muted transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          >
            ▾
          </span>
        </div>
      </button>
      {hydrated && open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/60">
          {children}
        </div>
      )}
    </section>
  );
}
