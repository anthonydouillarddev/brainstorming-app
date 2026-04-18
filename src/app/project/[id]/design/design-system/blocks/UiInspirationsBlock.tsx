"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createInspiration,
  deleteInspiration,
  deleteInspirationScreenshot,
  fetchInspirations,
  updateInspiration,
  uploadInspirationScreenshot,
  type InspirationCategory,
  type InspirationRow,
  type InspirationStatus,
} from "@/lib/design/inspirations-api";
import BlockStatus from "../components/BlockStatus";

const CATEGORY_META: Record<
  InspirationCategory,
  { label: string; emoji: string }
> = {
  "landing-hero": { label: "Landing / Hero", emoji: "🚀" },
  "pricing-table": { label: "Pricing", emoji: "💰" },
  "onboarding-flow": { label: "Onboarding", emoji: "🌱" },
  "dashboard-layout": { label: "Dashboard", emoji: "📊" },
  "form-login": { label: "Formulaires / Login", emoji: "📝" },
  "micro-interaction": { label: "Micro-interaction", emoji: "✨" },
  "navigation-pattern": { label: "Navigation", emoji: "🧭" },
  "empty-state": { label: "Empty state", emoji: "🌿" },
};

const STATUS_META: Record<
  InspirationStatus,
  { label: string; emoji: string; color: string }
> = {
  collected: {
    label: "Collecté",
    emoji: "📥",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  },
  analyzed: {
    label: "Analysé",
    emoji: "🔍",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  implemented: {
    label: "Implémenté",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  archived: {
    label: "Archivé",
    emoji: "🗄️",
    color: "bg-muted/10 border-border text-muted",
  },
};

type CategoryFilter = InspirationCategory | "all";

export default function UiInspirationsBlock({ projectId }: { projectId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InspirationRow[]>([]);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchInspirations(projectId);
      setItems(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement échoué");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (expanded) refresh();
  }, [expanded, refresh]);

  async function addCustom() {
    try {
      const row = await createInspiration({
        title: "",
        category: "landing-hero",
        project_id: projectId,
        status: "collected",
        rating: 3,
        position: items.length,
      });
      if (row) setItems((prev) => [...prev, row]);
    } catch {
      setError(
        "Impossible d'ajouter une inspiration. Vérifie ta connexion ou réessaie dans un instant."
      );
    }
  }

  async function patch(id: string, p: Partial<InspirationRow>) {
    const previous = items;
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));
    try {
      await updateInspiration(id, p);
    } catch {
      setItems(previous);
      setError("Sauvegarde échouée");
    }
  }

  async function remove(id: string) {
    const previous = items;
    const target = items.find((r) => r.id === id);
    setItems((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteInspiration(id);
      if (target?.screenshot_url) {
        await deleteInspirationScreenshot(target.screenshot_url);
      }
    } catch {
      setItems(previous);
      setError("Suppression échouée");
    }
  }

  async function uploadFor(id: string, file: File) {
    try {
      const url = await uploadInspirationScreenshot(file);
      await patch(id, { screenshot_url: url });
    } catch {
      setError(
        "Impossible d'uploader le screenshot. Colle une URL externe en attendant, ou réessaie."
      );
    }
  }

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((r) => r.category === filter)),
    [items, filter]
  );

  const categoryCounts = useMemo(() => {
    const out = {} as Record<InspirationCategory, number>;
    for (const cat of Object.keys(CATEGORY_META) as InspirationCategory[]) {
      out[cat] = items.filter((r) => r.category === cat).length;
    }
    return out;
  }, [items]);

  const ok = items.length >= 3;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          💡 Banque d&apos;inspirations UI
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            V4
          </span>
          <span className="text-muted text-sm font-normal">({items.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={!!error} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Sites aimés · composants à copier · effets UI.</strong>{" "}
            Upload screenshot ou colle une URL, catégorise (8 types), tague, note. Stockage
            Supabase dédié pour réutilisation cross-projet.
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-500/10 border border-red-500/40 text-red-700 dark:text-red-300 text-xs px-3 py-2 rounded flex items-start gap-2"
            >
              <span aria-hidden>❌</span>
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-300 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded"
                aria-label="Fermer le message d'erreur"
              >
                ×
              </button>
            </div>
          )}

          {loading && (
            <div className="text-xs text-muted py-4 text-center italic">
              Chargement des inspirations…
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">Filtre :</span>
              <button
                onClick={() => setFilter("all")}
                className={`text-[11px] px-2 py-1 rounded border transition ${
                  filter === "all"
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                Tout ({items.length})
              </button>
              {(Object.keys(CATEGORY_META) as InspirationCategory[]).map((cat) => {
                const count = categoryCounts[cat];
                if (count === 0) return null;
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`text-[11px] px-2 py-1 rounded border transition ${
                      filter === cat
                        ? "bg-accent text-white border-accent"
                        : "border-border hover:bg-accent/10"
                    }`}
                  >
                    {meta.emoji} {meta.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((r) => {
                const smeta = STATUS_META[r.status];
                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-lg border ${smeta.color} space-y-2`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={r.category}
                        onChange={(e) =>
                          patch(r.id, { category: e.target.value as InspirationCategory })
                        }
                        aria-label="Catégorie de l'inspiration"
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(CATEGORY_META) as InspirationCategory[]).map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={r.status}
                        onChange={(e) =>
                          patch(r.id, { status: e.target.value as InspirationStatus })
                        }
                        aria-label="Statut de l'inspiration"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(STATUS_META) as InspirationStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].emoji} {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => remove(r.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>

                    <input
                      type="text"
                      value={r.title}
                      onChange={(e) => patch(r.id, { title: e.target.value })}
                      placeholder="Titre (ex: Linear pricing page)"
                      className="w-full h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />

                    {r.screenshot_url ? (
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.screenshot_url}
                          alt={r.title || "Inspiration"}
                          className="w-full h-40 object-cover rounded border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => patch(r.id, { screenshot_url: "" })}
                          className="absolute top-1 right-1 w-8 h-8 rounded bg-black/60 text-white text-sm opacity-80 group-hover:opacity-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          aria-label="Retirer le screenshot"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputs.current[r.id]?.click()}
                        className="w-full h-24 rounded border border-dashed border-border hover:border-accent hover:bg-accent/5 transition text-xs text-muted flex items-center justify-center"
                      >
                        📷 Ajouter un screenshot
                      </button>
                    )}
                    <input
                      ref={(el) => {
                        fileInputs.current[r.id] = el;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFor(r.id, file);
                        e.target.value = "";
                      }}
                    />

                    <input
                      type="url"
                      value={r.source_url}
                      onChange={(e) => patch(r.id, { source_url: e.target.value })}
                      placeholder="URL source (https://...)"
                      className="w-full h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                    />

                    <textarea
                      value={r.note}
                      onChange={(e) => patch(r.id, { note: e.target.value })}
                      placeholder="Ce que j'aime / à reproduire"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        value={r.tags.join(", ")}
                        onChange={(e) =>
                          patch(r.id, {
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Tags (dark, animated, minimal…)"
                        className="h-7 px-2 text-[11px] rounded border border-border bg-card"
                      />
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => patch(r.id, { rating: n })}
                            className="text-sm transition hover:scale-110"
                            aria-label={`Note ${n}/5`}
                          >
                            {n <= r.rating ? "★" : "☆"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center text-xs text-muted py-6 px-4 leading-relaxed">
              <div className="text-3xl mb-2" aria-hidden>💡</div>
              <div className="font-medium text-foreground mb-1">Ta banque UI est vide</div>
              <div>
                Colle une URL, upload un screenshot, tague un composant que tu aimes. Sites web,
                pricing, onboarding, micro-interactions… tout ce qui t&apos;inspire pour construire
                ton produit.
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Nouvelle inspiration
          </button>
        </>
      )}
    </div>
  );
}
