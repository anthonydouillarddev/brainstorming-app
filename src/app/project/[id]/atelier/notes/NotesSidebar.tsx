"use client";

import { useMemo, useState } from "react";
import type { Note } from "../types";

type Props = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
  error: string | null;
};

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function preview(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export default function NotesSidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  creating,
  error,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <aside className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 flex flex-col gap-3 max-h-[calc(100vh-260px)] md:max-h-none md:min-h-[620px]">
      <button
        type="button"
        onClick={onCreate}
        disabled={creating}
        className="w-full px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60"
      >
        {creating ? "Création…" : "+ Nouvelle note"}
      </button>

      <input
        type="search"
        placeholder="🔍 Rechercher…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 bg-background/60 border border-border rounded-lg text-sm focus:outline-none focus:border-accent/60"
      />

      {error && (
        <div
          role="alert"
          className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
        >
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted text-center py-6">
            {query ? "Aucune note ne matche" : "Aucune note pour l'instant"}
          </div>
        ) : (
          filtered.map((note) => {
            const active = note.id === selectedId;
            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelect(note.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  active
                    ? "bg-accent/10 border-accent/40"
                    : "border-transparent hover:bg-background/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {note.pinned && (
                    <span className="text-accent" aria-label="Épinglée">
                      📌
                    </span>
                  )}
                  <span className="text-sm font-medium truncate">
                    {note.title || "Sans titre"}
                  </span>
                </div>
                {note.content && (
                  <div className="text-xs text-muted truncate mt-0.5">
                    {preview(note.content)}
                  </div>
                )}
                <div className="text-[11px] text-muted mt-1">
                  {formatRelativeDate(note.updated_at)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
