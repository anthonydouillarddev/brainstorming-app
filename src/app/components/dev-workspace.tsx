"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEV_KINDS,
  DEV_LINK_STATUSES,
  type DevItem,
  type DevItemKind,
  type DevLinkStatus,
} from "@/lib/types";

type NewItemDraft = {
  title: string;
  content: string;
  url: string;
  tagsInput: string;
};

const EMPTY_DRAFT: NewItemDraft = {
  title: "",
  content: "",
  url: "",
  tagsInput: "",
};

const LINK_STATUS_STYLE: Record<DevLinkStatus, string> = {
  not_opened: "bg-gray-500/15 text-muted",
  in_progress: "bg-blue-500/15 text-blue-500",
  done: "bg-green-500/15 text-green-500",
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export default function DevWorkspace({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: DevItem[];
}) {
  const [items, setItems] = useState<DevItem[]>(initialItems);
  const [activeKind, setActiveKind] = useState<DevItemKind>("idea");
  const [draft, setDraft] = useState<NewItemDraft>(EMPTY_DRAFT);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const supabase = createClient();
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      for (const id of Object.values(timers)) clearTimeout(id);
    };
  }, []);

  const itemsByKind = useMemo(() => {
    const map = new Map<DevItemKind, DevItem[]>();
    for (const kind of DEV_KINDS) map.set(kind.value, []);
    for (const it of items) {
      const bucket = map.get(it.kind);
      if (bucket) bucket.push(it);
    }
    for (const [, bucket] of map) {
      bucket.sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }
    return map;
  }, [items]);

  const counts = useMemo(() => {
    const map: Record<DevItemKind, number> = {
      idea: 0,
      link: 0,
      doc: 0,
      info: 0,
      pref: 0,
    };
    for (const it of items) map[it.kind]++;
    return map;
  }, [items]);

  const visibleItems = itemsByKind.get(activeKind) ?? [];
  const activeKindDef = DEV_KINDS.find((k) => k.value === activeKind)!;
  const isLinkKind = activeKind === "link";

  function commit(next: DevItem[]) {
    setItems(next);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    if (isLinkKind && !draft.url.trim()) return;

    const payload = {
      user_id: userId,
      kind: activeKind,
      title: draft.title.trim(),
      content: draft.content.trim() || null,
      url: isLinkKind ? draft.url.trim() : null,
      tags: parseTags(draft.tagsInput),
      status: isLinkKind ? ("not_opened" as DevLinkStatus) : null,
      position: (itemsByKind.get(activeKind)?.length ?? 0),
    };

    const { data, error } = await supabase
      .from("dev_items")
      .insert(payload)
      .select()
      .single();

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (data) {
      commit([...items, data as DevItem]);
      setDraft(EMPTY_DRAFT);
    }
  }

  const updateItem = useCallback(
    (id: string, patch: Partial<DevItem>) => {
      commit(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
      const previous = items;
      saveTimers.current[id] = setTimeout(async () => {
        const { error } = await supabase
          .from("dev_items")
          .update(patch)
          .eq("id", id);
        if (error) {
          commit(previous);
          alert("Erreur : " + error.message);
        }
      }, 600);
    },
    [items, supabase]
  );

  async function deleteItem(id: string) {
    const previous = items;
    commit(items.filter((it) => it.id !== id));
    setExpanded(null);
    const { error } = await supabase.from("dev_items").delete().eq("id", id);
    if (error) {
      commit(previous);
      alert("Erreur : " + error.message);
    }
  }

  async function persistPositions(reordered: DevItem[]) {
    const updates = reordered.map((it, idx) => ({ id: it.id, position: idx }));
    await Promise.all(
      updates.map(({ id, position }) =>
        supabase.from("dev_items").update({ position }).eq("id", id)
      )
    );
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const current = itemsByKind.get(activeKind) ?? [];
    const fromIdx = current.findIndex((it) => it.id === dragId);
    const toIdx = current.findIndex((it) => it.id === overId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...current];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const reorderedWithPos = reordered.map((it, idx) => ({ ...it, position: idx }));
    const next = items.map((it) => {
      const found = reorderedWithPos.find((r) => r.id === it.id);
      return found ?? it;
    });
    commit(next);
  }

  function handleDragEnd() {
    if (!dragId) return;
    setDragId(null);
    const current = itemsByKind.get(activeKind) ?? [];
    persistPositions(current);
  }

  return (
    <div className="space-y-5">
      {/* Tabs — kind selector */}
      <div className="flex flex-wrap gap-2">
        {DEV_KINDS.map((k) => {
          const active = k.value === activeKind;
          return (
            <button
              key={k.value}
              onClick={() => {
                setActiveKind(k.value);
                setDraft(EMPTY_DRAFT);
                setExpanded(null);
              }}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-card/80 border-border text-muted hover:text-foreground"
              }`}
            >
              <span className="mr-1">{k.emoji}</span>
              {k.label}
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  active ? "bg-white/20" : "bg-background/60"
                }`}
              >
                {counts[k.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kind description */}
      <p className="text-xs text-muted italic">{activeKindDef.description}</p>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 space-y-3 shadow-sm"
      >
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder={
            isLinkKind
              ? "Titre du lien (ex. Refactoring UI)"
              : activeKind === "idea"
                ? "Idée (ex. Nouveau skill /prd)"
                : "Titre..."
          }
          className="w-full px-3 py-2 bg-background/60 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          required
        />
        {isLinkKind && (
          <input
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            type="url"
            placeholder="https://..."
            className="w-full px-3 py-2 bg-background/60 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            required
          />
        )}
        {!isLinkKind && (
          <textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Notes, description... (optionnel)"
            rows={2}
            className="w-full px-3 py-2 bg-background/60 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all resize-none"
          />
        )}
        <div className="flex gap-2 flex-wrap">
          <input
            value={draft.tagsInput}
            onChange={(e) => setDraft({ ...draft, tagsInput: e.target.value })}
            placeholder="tags, séparés, par virgules"
            className="flex-1 min-w-[180px] px-3 py-2 bg-background/60 border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          />
          <button
            type="submit"
            disabled={!draft.title.trim() || (isLinkKind && !draft.url.trim())}
            className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Ajouter
          </button>
        </div>
      </form>

      {/* Items list */}
      <div className="space-y-2">
        {visibleItems.length === 0 && (
          <div className="bg-card/60 border border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">{activeKindDef.emoji}</p>
            <p className="text-sm text-muted">
              Rien dans {activeKindDef.label.toLowerCase()} pour l&apos;instant.
            </p>
          </div>
        )}
        {visibleItems.map((it) => {
          const isOpen = expanded === it.id;
          return (
            <div
              key={it.id}
              draggable
              onDragStart={() => handleDragStart(it.id)}
              onDragOver={(e) => handleDragOver(e, it.id)}
              onDragEnd={handleDragEnd}
              className={`bg-card/80 backdrop-blur-sm border border-border rounded-xl transition-all ${
                dragId === it.id ? "opacity-50" : "hover:border-accent/40"
              }`}
            >
              <div className="px-4 py-3 flex items-start gap-3 group">
                <span
                  className="text-muted cursor-move text-xs mt-1 select-none"
                  title="Glisser pour réordonner"
                >
                  ⋮⋮
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    {isLinkKind && it.url ? (
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:text-accent transition-colors truncate"
                      >
                        {it.title}
                      </a>
                    ) : (
                      <span className="text-sm font-medium truncate">{it.title}</span>
                    )}
                    {isLinkKind && it.status && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${LINK_STATUS_STYLE[it.status]}`}
                      >
                        {DEV_LINK_STATUSES.find((s) => s.value === it.status)?.emoji}{" "}
                        {DEV_LINK_STATUSES.find((s) => s.value === it.status)?.label}
                      </span>
                    )}
                  </div>
                  {it.url && isLinkKind && (
                    <p className="text-[11px] text-muted truncate mt-0.5">{it.url}</p>
                  )}
                  {it.content && !isOpen && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{it.content}</p>
                  )}
                  {it.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {it.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-background/60 text-muted font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : it.id)}
                    className="text-muted hover:text-foreground text-xs px-2 py-1"
                    aria-label="Éditer"
                  >
                    {isOpen ? "▾" : "✎"}
                  </button>
                  <button
                    onClick={() => deleteItem(it.id)}
                    className="text-muted hover:text-red-400 text-xs px-2 py-1 opacity-40 group-hover:opacity-100 transition-opacity"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 bg-background/40 border-t border-border space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                      Titre
                    </label>
                    <input
                      value={it.title}
                      onChange={(e) => updateItem(it.id, { title: e.target.value })}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  {isLinkKind && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={it.url ?? ""}
                        onChange={(e) => updateItem(it.id, { url: e.target.value })}
                        className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  )}
                  {!isLinkKind && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                        Contenu
                      </label>
                      <textarea
                        value={it.content ?? ""}
                        onChange={(e) => updateItem(it.id, { content: e.target.value })}
                        rows={4}
                        className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                        Tags
                      </label>
                      <input
                        value={it.tags.join(", ")}
                        onChange={(e) =>
                          updateItem(it.id, { tags: parseTags(e.target.value) })
                        }
                        placeholder="séparés, par virgules"
                        className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                    {isLinkKind && (
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                          Statut
                        </label>
                        <select
                          value={it.status ?? "not_opened"}
                          onChange={(e) =>
                            updateItem(it.id, {
                              status: e.target.value as DevLinkStatus,
                            })
                          }
                          className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                        >
                          {DEV_LINK_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.emoji} {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
