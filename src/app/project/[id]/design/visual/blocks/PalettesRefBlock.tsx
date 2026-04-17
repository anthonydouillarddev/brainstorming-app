"use client";

import PaletteRow from "../components/PaletteRow";
import CollapsibleSection from "../components/CollapsibleSection";
import { TEST_COLORS, type SelectedShade } from "../components/shared";

export default function PalettesRefBlock({
  selectedKeys,
  onToggleShade,
}: {
  selectedKeys: Set<string>;
  onToggleShade: (shade: SelectedShade) => void;
}) {
  return (
    <div className="border-t border-border pt-6">
      <CollapsibleSection
        title="2. Palettes de référence"
        showCountInTitle={`(${TEST_COLORS.length} · tuning par défaut)`}
        expandButtonLabel={`Afficher les ${TEST_COLORS.length} palettes de référence`}
      >
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
      </CollapsibleSection>
    </div>
  );
}
