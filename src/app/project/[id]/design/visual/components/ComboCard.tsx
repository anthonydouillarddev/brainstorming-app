"use client";

import { COMBO_STYLES, type ColorCombo } from "@/lib/design/combos";

export default function ComboCard({
  combo,
  onPickColor,
  onLoadAllToPreview,
}: {
  combo: ColorCombo;
  onPickColor: (hex: string, comboId: string, index: number, comboName: string) => void;
  onLoadAllToPreview: (combo: ColorCombo) => void;
}) {
  const style = COMBO_STYLES.find((s) => s.value === combo.style);
  return (
    <div className="bg-card/60 border border-border rounded-xl p-3 space-y-2">
      <div>
        <div className="font-semibold text-sm">
          {style?.emoji} {combo.name}
        </div>
        {combo.note && <div className="text-[11px] text-muted">{combo.note}</div>}
      </div>
      <div className="flex gap-1 h-10 rounded overflow-hidden border border-border">
        {combo.colors.map((c, i) => (
          <button
            key={`${combo.id}-${i}`}
            onClick={() => onPickColor(c, combo.id, i, combo.name)}
            className="flex-1 transition hover:scale-y-110 cursor-pointer"
            style={{ background: c }}
            title={`${c} — clic pour ajouter au mariage`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 font-mono text-[10px] text-muted flex-wrap">
          {combo.colors.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <button
          onClick={() => onLoadAllToPreview(combo)}
          className="text-[11px] px-2 py-1 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
        >
          Voir en preview
        </button>
      </div>
    </div>
  );
}
