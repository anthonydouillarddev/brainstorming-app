"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectTypeDef, ProjectWorld } from "@/lib/types";

type Props = {
  open: boolean;
  worlds: ProjectWorld[];
  types: ProjectTypeDef[];
  selectedTypeId: string | null;
  onSelect: (type: ProjectTypeDef) => void;
  onClose: () => void;
};

const AUTRE_TAB = "__autre__";

export default function TypePickerModal({
  open,
  worlds,
  types,
  selectedTypeId,
  onSelect,
  onClose,
}: Props) {
  const [userPickedSlug, setUserPickedSlug] = useState<string | null>(null);
  const activeWorldSlug = userPickedSlug ?? worlds[0]?.slug ?? AUTRE_TAB;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const worldBySlug = useMemo(
    () => new Map(worlds.map((w) => [w.slug, w])),
    [worlds]
  );

  const typesInActiveTab = useMemo(() => {
    if (activeWorldSlug === AUTRE_TAB) {
      return types.filter((t) => t.slug.startsWith("autre-"));
    }
    const world = worldBySlug.get(activeWorldSlug);
    if (!world) return [];
    return types
      .filter((t) => t.worldId === world.id && !t.slug.startsWith("autre-"))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [activeWorldSlug, types, worldBySlug]);

  if (!open) return null;
  const portalContainer =
    typeof document === "undefined" ? null : document.getElementById("modal-root");
  if (!portalContainer) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choisir le type de projet"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">Choisis le type de projet</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-background/60 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-4 overflow-x-auto">
          {worlds.map((w) => (
            <button
              key={w.slug}
              type="button"
              onClick={() => setUserPickedSlug(w.slug)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeWorldSlug === w.slug
                  ? "bg-accent text-white shadow-sm"
                  : "bg-background/60 text-muted hover:text-foreground"
              }`}
            >
              <span className="mr-1.5">{w.icon}</span>
              {w.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUserPickedSlug(AUTRE_TAB)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeWorldSlug === AUTRE_TAB
                ? "bg-accent text-white shadow-sm"
                : "bg-background/60 text-muted hover:text-foreground"
            }`}
          >
            <span className="mr-1.5">🧩</span>
            Autre
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {typesInActiveTab.length === 0 ? (
            <div className="text-muted text-sm text-center py-8">
              Aucun type disponible dans cette catégorie.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typesInActiveTab.map((type) => {
                const isSelected = selectedTypeId === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      onSelect(type);
                      onClose();
                    }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-accent/15 border-accent/60 shadow-sm"
                        : "bg-background/60 border-border hover:border-muted hover:bg-background/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-sm ${
                            isSelected ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {type.name}
                        </div>
                        <div className="text-xs text-muted mt-1 line-clamp-2">
                          {type.description}
                        </div>
                      </div>
                      {isSelected && <span className="text-accent text-lg">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalContainer);
}
