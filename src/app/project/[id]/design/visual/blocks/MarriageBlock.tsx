"use client";

import { useState } from "react";
import { createCustomCombo } from "@/lib/design/colors-api";
import { Help } from "@/app/design-spike/help";
import type { TokensState } from "@/app/design-spike/tokens-block";
import MarriagePreview from "../components/MarriagePreview";
import type { SelectedShade } from "../components/shared";
import { useToast } from "@/app/components/toast";

export default function MarriageBlock({
  selected,
  tokens,
  onRemove,
  onMove,
  onClear,
  onChangeColor,
}: {
  selected: SelectedShade[];
  tokens: TokensState;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
  onChangeColor: (id: string, newHex: string) => void;
}) {
  const toast = useToast();
  const [comboName, setComboName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveAsCombo() {
    if (selected.length < 2 || !comboName.trim()) return;
    setSaving(true);
    try {
      const row = await createCustomCombo({
        name: comboName.trim(),
        colors: selected.map((s) => s.hex),
        style: "custom",
      });
      if (row) {
        setSaved(true);
        setComboName("");
        toast.success(`Mariage sauvegardé sous « ${row.name} »`);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      toast.error("Sauvegarde du combo impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="marriage-section"
      className="space-y-4 scroll-mt-4 border-t border-border pt-6"
    >
      <h2 className="text-xl font-bold flex items-center gap-1">
        6. Preview du mariage
        <Help topic="marriage" />
      </h2>
      <p className="text-xs text-muted">
        Assemble tes choix de couleurs et vois leur mariage réel sur des composants avec tous tes
        tokens appliqués.
      </p>
      <MarriagePreview
        selected={selected}
        onRemove={onRemove}
        onMove={onMove}
        onClear={onClear}
        onChangeColor={onChangeColor}
        tokens={tokens}
      />
      {selected.length >= 2 && (
        <div className="bg-card/60 border border-border rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Sauver ce mariage comme combo :</span>
          <input
            type="text"
            value={comboName}
            onChange={(e) => setComboName(e.target.value)}
            placeholder="Ex : Mon style vintage"
            className="h-9 px-3 text-sm rounded border border-border bg-card flex-1 min-w-[200px]"
          />
          <button
            onClick={handleSaveAsCombo}
            disabled={!comboName.trim() || saving}
            className="h-9 px-4 text-sm rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Sauvegarde..." : saved ? "✓ Sauvé" : "Sauver"}
          </button>
        </div>
      )}
    </div>
  );
}
