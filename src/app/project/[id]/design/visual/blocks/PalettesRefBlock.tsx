"use client";

import { useState } from "react";
import PaletteRow from "../components/PaletteRow";
import { TEST_COLORS, type SelectedShade } from "../components/shared";

export default function PalettesRefBlock({
  selectedKeys,
  onToggleShade,
}: {
  selectedKeys: Set<string>;
  onToggleShade: (shade: SelectedShade) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        2. Palettes de référence
        <span className="text-muted font-normal text-sm">
          ({TEST_COLORS.length} · tuning par défaut)
        </span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher les {TEST_COLORS.length} palettes de référence
        </button>
      )}

      {!collapsed && (
        <div className="space-y-8">
          {TEST_COLORS.map(({ name, hex }) => (
            <PaletteRow
              key={hex}
              name={name}
              hex={hex}
              selected={selectedKeys}
              onToggleShade={onToggleShade}
            />
          ))}
        </div>
      )}
    </div>
  );
}
