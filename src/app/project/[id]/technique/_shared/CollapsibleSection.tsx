"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import BlockStatus from "./BlockStatus";

// Wrapper collapsible utilisé par tous les blocs des chapitres Technique.
// Header cliquable (emoji + titre + description + status + chevron) + content.
// Persiste l'état open/closed en localStorage via `storageKey`.
//
// Comportement par défaut (option B choisie par Anthony) :
// - Tous les blocs ouverts au premier chargement
// - Auto-collapse quand on passe de <100% à 100% rempli pendant la session
// - Respect du choix user : s'il rouvre manuellement un bloc 100%, il reste ouvert
// - Les Exports (sans filled/total) restent fermés par défaut via defaultOpen={false}

export default function CollapsibleSection({
  emoji,
  title,
  description,
  filled,
  total,
  storageKey,
  defaultOpen = true,
  autoCollapseWhenFull = true,
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
  const prevFilledRef = useRef<number | undefined>(filled);
  const prevTotalRef = useRef<number | undefined>(total);

  // Hydration initiale : lit localStorage, ou auto-collapse si déjà 100% sans saved.
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

  // Watch : auto-collapse quand on passe de <100% à 100% pendant la session.
  // N'écrit PAS en localStorage (pour permettre à l'user de rouvrir sans que ça
  // soit mémorisé comme "closed" définitif).
  useEffect(() => {
    if (!hydrated || !autoCollapseWhenFull) return;
    if (typeof filled !== "number" || typeof total !== "number" || total <= 0) return;

    const prevFilled = prevFilledRef.current;
    const prevTotal = prevTotalRef.current;
    const wasFull =
      typeof prevFilled === "number" &&
      typeof prevTotal === "number" &&
      prevTotal > 0 &&
      prevFilled >= prevTotal;
    const isFull = filled >= total;

    if (!wasFull && isFull) {
      setOpen(false);
    }

    prevFilledRef.current = filled;
    prevTotalRef.current = total;
  }, [filled, total, autoCollapseWhenFull, hydrated]);

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
