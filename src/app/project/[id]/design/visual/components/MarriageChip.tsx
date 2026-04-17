"use client";

import { useEffect, useRef, useState } from "react";
import { roleFor, type SelectedShade } from "./shared";

export default function MarriageChip({
  shade,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onChangeColor,
}: {
  shade: SelectedShade;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onChangeColor: (newHex: string) => void;
}) {
  const role = roleFor(index);
  const [editing, setEditing] = useState(false);
  const [draftHex, setDraftHex] = useState(shade.hex);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftHex(shade.hex);
  }, [shade.hex]);

  useEffect(() => {
    if (!editing) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing]);

  function commit() {
    const cleaned = draftHex.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(cleaned)) {
      onChangeColor(cleaned);
    }
    setEditing(false);
  }

  return (
    <div className="flex flex-col items-center gap-1.5 relative">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
        title={role.hint}
      >
        {role.label}
      </span>
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <button
          onClick={() => setEditing((v) => !v)}
          className={`w-32 h-32 block cursor-pointer transition ${
            editing ? "ring-4 ring-accent ring-offset-2 ring-offset-card" : ""
          }`}
          style={{ background: shade.hex }}
          title="Clic pour ajuster manuellement"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] font-mono p-1.5 text-center backdrop-blur-sm pointer-events-none">
          {shade.hex}
          {shade.source && <div className="opacity-70 text-[9px] truncate">{shade.source}</div>}
        </div>
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-red-500 transition opacity-0 group-hover:opacity-100"
          title="Retirer"
          aria-label="Retirer"
        >
          ×
        </button>
      </div>

      {editing && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-card border border-border rounded-xl p-3 shadow-2xl z-50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Ajuster {role.label}</span>
            <button
              onClick={() => setEditing(false)}
              className="text-muted hover:text-foreground text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-accent/10"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <input
            type="color"
            value={shade.hex}
            onChange={(e) => onChangeColor(e.target.value)}
            className="w-full h-12 rounded-lg border border-border cursor-pointer"
            title="Choisir une couleur"
          />
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Code hex
            </label>
            <input
              type="text"
              value={draftHex}
              onChange={(e) => setDraftHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraftHex(shade.hex);
                  setEditing(false);
                }
              }}
              placeholder="#RRGGBB"
              className="w-full h-9 px-3 text-sm font-mono rounded border border-border bg-background"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDraftHex(shade.hex);
                setEditing(false);
              }}
              className="flex-1 h-9 text-xs rounded border border-border hover:bg-accent/10 transition"
            >
              Annuler
            </button>
            <button
              onClick={commit}
              className="flex-1 h-9 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover transition"
            >
              ✓ Valider
            </button>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-card border-r border-b border-border rotate-45 -mt-1.5"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex gap-1">
        <button
          onClick={onMoveLeft}
          disabled={index === 0}
          className="w-7 h-7 rounded border border-border bg-card hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          title="Déplacer à gauche"
          aria-label="Déplacer à gauche"
        >
          ◀
        </button>
        <button
          onClick={onMoveRight}
          disabled={index === total - 1}
          className="w-7 h-7 rounded border border-border bg-card hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          title="Déplacer à droite"
          aria-label="Déplacer à droite"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
