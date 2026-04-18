"use client";

import type { FrontendState, StylingApproach } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const APPROACHES: { value: StylingApproach; label: string; score: string; hint: string }[] = [
  { value: "tailwind-v4", label: "Tailwind v4", score: "🔥", hint: "Défaut Mindeck. CSS-first, bundle minimal." },
  { value: "tailwind-v3", label: "Tailwind v3", score: "🔥", hint: "Config JS classique." },
  { value: "css-modules", label: "CSS Modules", score: "🔥", hint: "Scoped CSS natif." },
  { value: "styled-components", label: "Styled-Components", score: "🪦", hint: "Runtime JS overhead." },
  { value: "shadcn", label: "shadcn/ui + Tailwind", score: "🔥", hint: "Composants copiés, full ownership." },
  { value: "vanilla-extract", label: "Vanilla Extract", score: "🌱", hint: "Type-safe CSS zero-runtime." },
  { value: "panda", label: "Panda CSS", score: "🌱", hint: "Tailwind-like + type-safety." },
];

export default function StylingBlock({
  state,
  onChange,
}: {
  state: FrontendState;
  onChange: (patch: Partial<FrontendState>) => void;
}) {
  const filled = state.styling ? 1 : 0;

  return (
    <CollapsibleSection
      emoji="🎨"
      title="Styling"
      description="Utility-first recommandé. Éviter runtime JS overhead (styled-components)."
      filled={filled}
      total={1}
      storageKey="mindeck:technique:frontend:styling:open"
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {APPROACHES.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => onChange({ styling: a.value })}
            className={`text-left rounded-xl border p-2.5 transition ${
              state.styling === a.value
                ? "bg-accent/10 border-accent"
                : "bg-background border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold">{a.label}</span>
              <span className="text-[10px]">{a.score}</span>
            </div>
            <div className="text-[11px] text-muted">{a.hint}</div>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={state.useShadcn}
          onChange={(e) => onChange({ useShadcn: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <span>Utilise shadcn/ui pour les composants de base</span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes / extras</span>
        <input
          type="text"
          value={state.stylingExtras}
          onChange={(e) => onChange({ stylingExtras: e.target.value })}
          placeholder="Ex: design tokens en variables CSS, pas de dark: prefix"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </CollapsibleSection>
  );
}
