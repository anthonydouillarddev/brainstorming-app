"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TECHNIQUE_CHAPTERS, type TechniqueChapterKey } from "../chapters";

// Command palette (Cmd+K / Ctrl+K) pour naviguer rapidement dans l'onglet Technique.
// Actions : aller à un chapitre, ouvrir le mode Débutant/Formulaire du chap actif, etc.

export interface CommandAction {
  id: string;
  label: string;
  group: "navigation" | "actions" | "export";
  emoji?: string;
  shortcut?: string;
  onExecute: () => void;
}

export default function CommandPalette({
  open,
  onClose,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
}) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered.length, activeIdx]);

  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const action = filtered[activeIdx];
      if (action) {
        action.onExecute();
        onClose();
      }
      return;
    }
  }

  if (!open) return null;

  const grouped: Record<CommandAction["group"], CommandAction[]> = {
    navigation: [],
    actions: [],
    export: [],
  };
  for (const a of filtered) grouped[a.group].push(a);

  const groupLabels: Record<CommandAction["group"], string> = {
    navigation: "📚 Chapitres",
    actions: "⚙️ Actions",
    export: "📤 Exports",
  };

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
      onKeyDown={handleKey}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une action, un chapitre…"
            className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted">
              Aucun résultat pour &quot;{query}&quot;
            </div>
          ) : (
            (Object.keys(grouped) as CommandAction["group"][]).map((group) => {
              const items = grouped[group];
              if (items.length === 0) return null;
              return (
                <div key={group} className="py-1">
                  <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted font-semibold">
                    {groupLabels[group]}
                  </div>
                  {items.map((a) => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          a.onExecute();
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition ${
                          isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-background/60"
                        }`}
                      >
                        {a.emoji && <span className="text-base shrink-0">{a.emoji}</span>}
                        <span className="flex-1 truncate">{a.label}</span>
                        {a.shortcut && (
                          <span className="text-[10px] text-muted font-mono">{a.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted">
          <span><kbd className="font-mono">↑↓</kbd> naviguer</span>
          <span><kbd className="font-mono">↵</kbd> exécuter</span>
          <span><kbd className="font-mono">Esc</kbd> fermer</span>
        </div>
      </div>
    </div>
  );
}

// Hook pour écouter Cmd+K / Ctrl+K globalement.
export function useCmdK(onTrigger: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onTrigger();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTrigger]);
}

// Helper pour générer les actions de navigation chaps.
export function buildChapterNavActions(
  onSelect: (key: TechniqueChapterKey) => void
): CommandAction[] {
  return TECHNIQUE_CHAPTERS.map((chap) => ({
    id: `nav-${chap.key}`,
    label: `${chap.num}. ${chap.label}`,
    group: "navigation" as const,
    emoji: chap.emoji,
    onExecute: () => onSelect(chap.key),
  }));
}
