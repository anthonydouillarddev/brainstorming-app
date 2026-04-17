"use client";

import { useMemo, useState } from "react";
import {
  generateNeutralPalette,
  generateSemanticPalette,
  SEMANTIC_OPTIONS,
  DEFAULT_SEMANTIC_HUES,
  type PaletteShade,
  type SemanticRole,
} from "@/lib/design/oklch";
import { Help } from "./help";

const SEMANTIC_LABELS: Record<SemanticRole, { label: string; emoji: string; usage: string }> = {
  success: { label: "Success", emoji: "✅", usage: "Confirmations, états positifs" },
  warning: { label: "Warning", emoji: "⚠️", usage: "Alertes non bloquantes" },
  error: { label: "Error", emoji: "🚨", usage: "Erreurs, suppressions" },
  info: { label: "Info", emoji: "💬", usage: "Informations neutres" },
};

function ShadeStrip({ shades }: { shades: PaletteShade[] }) {
  // Layout responsive : les 12 cases s'ajustent sans débordement, avec hover pour infos
  return (
    <div className="grid grid-cols-12 gap-0.5 rounded-lg overflow-hidden border border-border">
      {shades.map((s) => (
        <div
          key={s.name}
          className="aspect-square relative group cursor-help"
          style={{ background: s.hex }}
          title={`shade ${s.name} · ${s.hex} · ratio blanc ${s.ratioVsWhite.toFixed(1)} / noir ${s.ratioVsBlack.toFixed(1)}`}
        >
          <span className="absolute inset-x-0 bottom-0 text-[8px] font-mono text-center bg-black/40 text-white py-0.5 opacity-0 group-hover:opacity-100 transition">
            {s.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ExtraColorsBlock({
  primaryHex,
}: {
  primaryHex: string;
}) {
  const [tintStrength, setTintStrength] = useState(0.5);
  const [collapsed, setCollapsed] = useState(true);
  const [semanticHues, setSemanticHues] = useState<Record<SemanticRole, number>>(
    DEFAULT_SEMANTIC_HUES
  );

  const neutrals = useMemo(
    () => generateNeutralPalette(primaryHex, tintStrength),
    [primaryHex, tintStrength]
  );
  const semantics = useMemo(
    () => ({
      success: generateSemanticPalette(semanticHues.success),
      warning: generateSemanticPalette(semanticHues.warning),
      error: generateSemanticPalette(semanticHues.error),
      info: generateSemanticPalette(semanticHues.info),
    }),
    [semanticHues]
  );

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        4. Neutrals & Semantics
        <span className="text-muted font-normal text-sm">
          (gris teintés + success/warning/error/info)
        </span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher Neutrals + Semantics
        </button>
      )}

      {!collapsed && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-6">
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">À quoi ça sert ?</strong> En complément de ta
            palette primary, tu as besoin de <strong>gris teintés</strong> (texte, bordures, fonds
            doux) et de <strong>couleurs sémantiques</strong> (success/warning/error/info pour les
            états). Les gris purs (#808080) sont morts — Refactoring UI recommande des gris avec
            une légère teinte de la primary pour cohérence.
          </div>

          {/* ─── NEUTRALS ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-base flex items-center gap-1">
                Neutrals (gris teintés)
                <Help topic="neutral" />
              </h3>
              <span className="text-xs text-muted">
                Hue dérivée de <span className="font-mono">{primaryHex}</span>
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-muted flex items-center justify-between">
                <span>Force de la teinte</span>
                <span className="font-mono normal-case">{(tintStrength * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={tintStrength}
                onChange={(e) => setTintStrength(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <p className="text-[11px] text-muted">
                0% = gris pur (terne) · 50% = teinte subtile (recommandé) · 100% = teinte bien
                visible
              </p>
            </div>
            <ShadeStrip shades={neutrals} />
          </div>

          {/* ─── SEMANTICS ─────────────────────────────────────────────────── */}
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-base flex items-center gap-1">
                Semantic colors
                <Help topic="semantic" />
              </h3>
              <span className="text-xs text-muted">Choisis une variante pour chaque rôle</span>
            </div>

            {(Object.keys(semantics) as SemanticRole[]).map((role) => {
              const info = SEMANTIC_LABELS[role];
              const options = SEMANTIC_OPTIONS[role];
              return (
                <div key={role} className="space-y-2">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <span className="text-sm font-semibold">
                      {info.emoji} {info.label}
                    </span>
                    <span className="text-[11px] text-muted">{info.usage}</span>
                  </div>
                  {/* Picker de teinte */}
                  <div className="flex flex-wrap gap-1">
                    {options.map((opt) => (
                      <button
                        key={opt.name}
                        onClick={() =>
                          setSemanticHues((prev) => ({ ...prev, [role]: opt.hue }))
                        }
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 ${
                          semanticHues[role] === opt.hue
                            ? "bg-accent/10 border-accent"
                            : "border-border hover:bg-accent/5"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-border"
                          style={{
                            background: `oklch(0.58 0.18 ${opt.hue})`,
                          }}
                        />
                        {opt.name}
                      </button>
                    ))}
                  </div>
                  <ShadeStrip shades={semantics[role]} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
