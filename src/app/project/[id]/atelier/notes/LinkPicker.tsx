"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Decision, DevItem, Todo } from "@/lib/types";
import type { LinkTarget } from "../types";

type Tab = "todo" | "decision" | "dev_item";

type Props = {
  current: LinkTarget | null;
  tasks: Todo[];
  ideas: Todo[];
  decisions: Decision[];
  devItems: DevItem[];
  onClose: () => void;
  onPick: (target: LinkTarget | null) => void;
};

export default function LinkPicker({
  current,
  tasks,
  ideas,
  decisions,
  devItems,
  onClose,
  onPick,
}: Props) {
  const [portalRoot] = useState<HTMLElement | null>(() =>
    typeof document === "undefined"
      ? null
      : document.getElementById("modal-root")
  );
  const [tab, setTab] = useState<Tab>(current?.kind ?? "todo");
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const todos = useMemo(() => [...tasks, ...ideas], [tasks, ideas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (tab === "todo") {
      return todos.filter((t) => !q || t.text.toLowerCase().includes(q));
    }
    if (tab === "decision") {
      return decisions.filter(
        (d) => !q || d.title.toLowerCase().includes(q)
      );
    }
    return devItems.filter((d) => !q || d.title.toLowerCase().includes(q));
  }, [tab, query, todos, decisions, devItems]);

  if (!portalRoot) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lier la note"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Lier à…</h2>
            <p className="text-xs text-muted mt-0.5">
              Choisis une tâche, décision ou dev item
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-background/60"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="flex gap-1 bg-background/40 border border-border rounded-lg p-1">
            <TabButton active={tab === "todo"} onClick={() => setTab("todo")}>
              📋 Tâches ({todos.length})
            </TabButton>
            <TabButton
              active={tab === "decision"}
              onClick={() => setTab("decision")}
            >
              🧭 Décisions ({decisions.length})
            </TabButton>
            <TabButton
              active={tab === "dev_item"}
              onClick={() => setTab("dev_item")}
            >
              🧪 Dev ({devItems.length})
            </TabButton>
          </div>
        </div>

        <div className="px-5 pt-3">
          <input
            type="search"
            autoFocus
            placeholder="🔍 Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 bg-background/60 border border-border rounded-lg text-sm focus:outline-none focus:border-accent/60"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted text-center py-8">
              Aucun résultat
            </div>
          ) : (
            filtered.map((item) => {
              const id = item.id;
              const isCurrent = current?.kind === tab && current.id === id;
              const label =
                tab === "todo"
                  ? (item as Todo).text
                  : tab === "decision"
                  ? (item as Decision).title
                  : (item as DevItem).title;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    onPick({ kind: tab as LinkTarget["kind"], id })
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    isCurrent
                      ? "bg-accent/15 border-accent/40 text-accent"
                      : "border-transparent hover:bg-background/60"
                  }`}
                >
                  <span className="text-sm truncate block">{label}</span>
                  {isCurrent && (
                    <span className="text-[10px] uppercase tracking-wider">
                      Lié actuellement
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          {current ? (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="text-xs text-red-500 hover:underline"
            >
              Retirer le lien
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalRoot);
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
        active
          ? "bg-accent text-white"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
