"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TYPO_RATIOS,
  SPACING_PRESETS,
  DENSITY_MULTIPLIERS,
  RADIUS_PRESETS,
  SHADOW_PRESETS,
  DEFAULT_GRADIENT,
  GRADIENT_PRESETS,
  generateTypoScale,
  generateSpacingScale,
  gradientToCss,
  type SpacingPresetKey,
  type DensityKey,
  type RadiusKey,
  type ShadowKey,
  type GradientState,
  type GradientType,
} from "@/lib/design/tokens";
import {
  FONT_PAIRINGS,
  FONT_STYLES,
  FONTS_LIBRARY,
  fontCategoryLabel,
  loadFontPairing,
  loadSingleFont,
  loadFontByName,
  type FontPairing,
  type LibraryFont,
  type FontCategory,
} from "@/lib/design/fonts";
import { Help, type HelpKey } from "./help";

export type FontMode = "pairing" | "custom";

export interface CustomFonts {
  heading?: string;
  body?: string;
  mono?: string;
}

// Override par composant : null = hériter du global, sinon override
export interface ComponentOverride {
  radius: RadiusKey | null;
  shadow: ShadowKey | null;
}

export interface ComponentTokens {
  buttonPrimary: ComponentOverride;
  buttonSecondary: ComponentOverride;
  card: ComponentOverride;
  input: ComponentOverride;
  modal: ComponentOverride;
}

export const DEFAULT_COMPONENT_TOKENS: ComponentTokens = {
  buttonPrimary: { radius: null, shadow: "sm" },
  buttonSecondary: { radius: null, shadow: null },
  card: { radius: null, shadow: null },
  input: { radius: null, shadow: null },
  modal: { radius: "xl", shadow: "xl" },
};

export interface TokensState {
  typoBaseSize: number;
  typoRatio: number;
  spacingPreset: SpacingPresetKey;
  spacingDensity: DensityKey;
  radius: RadiusKey;
  shadow: ShadowKey;
  fontPairingId: string;
  fontMode: FontMode;
  customFonts: CustomFonts;
  gradient: GradientState;
  components: ComponentTokens;
}

export const DEFAULT_TOKENS: TokensState = {
  typoBaseSize: 16,
  typoRatio: 1.25,
  spacingPreset: "hybrid",
  spacingDensity: "normal",
  radius: "md",
  shadow: "md",
  fontPairingId: "system",
  fontMode: "pairing",
  customFonts: {},
  gradient: DEFAULT_GRADIENT,
  components: DEFAULT_COMPONENT_TOKENS,
};

// Résout le radius pour un composant (override → global → fallback)
export function resolveRadius(tokens: TokensState, component: keyof ComponentTokens): RadiusKey {
  return tokens.components[component].radius ?? tokens.radius;
}

export function resolveShadow(tokens: TokensState, component: keyof ComponentTokens): ShadowKey {
  return tokens.components[component].shadow ?? tokens.shadow;
}

// Résout les fonts réellement à utiliser selon le mode
export function resolveFonts(tokens: TokensState): {
  heading: string;
  body: string;
  mono: string;
} {
  if (tokens.fontMode === "custom") {
    return {
      heading: tokens.customFonts.heading ?? "system-ui, sans-serif",
      body: tokens.customFonts.body ?? "system-ui, sans-serif",
      mono: tokens.customFonts.mono ?? "ui-monospace, monospace",
    };
  }
  const p = getFontPairing(tokens.fontPairingId);
  return {
    heading: `"${p.heading.family}", ${p.heading.fallback}`,
    body: `"${p.body.family}", ${p.body.fallback}`,
    mono: p.mono ? `"${p.mono.family}", ${p.mono.fallback}` : "ui-monospace, monospace",
  };
}

export function getFontPairing(id: string): FontPairing {
  return FONT_PAIRINGS.find((p) => p.id === id) ?? FONT_PAIRINGS[0];
}

// Merge safe : complète un TokensState partiel (ou de l'ancienne version) avec les valeurs par défaut.
// Indispensable pour charger un localStorage qui ne contient pas tous les nouveaux champs.
export function mergeTokens(partial: Partial<TokensState> | null | undefined): TokensState {
  if (!partial) return DEFAULT_TOKENS;
  return {
    ...DEFAULT_TOKENS,
    ...partial,
    customFonts: { ...DEFAULT_TOKENS.customFonts, ...(partial.customFonts ?? {}) },
    gradient: partial.gradient ?? DEFAULT_TOKENS.gradient,
    components: {
      ...DEFAULT_TOKENS.components,
      ...(partial.components ?? {}),
    },
  };
}

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────

function TypographyPicker({
  baseSize,
  ratio,
  onChange,
}: {
  baseSize: number;
  ratio: number;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  const scale = useMemo(() => generateTypoScale(baseSize, ratio), [baseSize, ratio]);
  const ratioInfo = TYPO_RATIOS.find((r) => r.value === ratio);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted">
            Base size
          </label>
          <div className="flex gap-1">
            {[14, 15, 16, 17, 18].map((s) => (
              <button
                key={s}
                onClick={() => onChange({ typoBaseSize: s })}
                className={`flex-1 h-9 text-sm rounded border transition ${
                  baseSize === s
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted">
            Ratio modulaire
          </label>
          <select
            value={ratio}
            onChange={(e) => onChange({ typoRatio: parseFloat(e.target.value) })}
            className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
          >
            {TYPO_RATIOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value} — {r.name}
              </option>
            ))}
          </select>
          {ratioInfo && <p className="text-[11px] text-muted">{ratioInfo.hint}</p>}
        </div>
      </div>

      <div className="bg-card/60 border border-border rounded-lg p-4 space-y-1 max-h-96 overflow-y-auto">
        {scale.sizes
          .slice()
          .reverse()
          .map((size) => (
            <div
              key={size.name}
              className="flex items-baseline gap-3 py-1 border-b border-border last:border-0"
            >
              <span className="text-[10px] font-mono text-muted w-16 shrink-0 uppercase">
                {size.name}
              </span>
              <span className="text-[10px] font-mono text-muted w-20 shrink-0">
                {size.px}px / {size.rem}rem
              </span>
              <span
                className="font-medium truncate"
                style={{ fontSize: `${size.px}px`, lineHeight: size.lineHeight }}
              >
                Aa Bb Cc 123
              </span>
            </div>
          ))}
      </div>

      <div className="text-[11px] text-muted">
        💡 La base ({baseSize}px) est la taille du body. Les autres tailles dérivent du ratio
        choisi (puissances).
      </div>
    </div>
  );
}

// ─── SPACING ────────────────────────────────────────────────────────────────

function SpacingPicker({
  preset,
  density,
  onChange,
}: {
  preset: SpacingPresetKey;
  density: DensityKey;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  const scale = useMemo(() => generateSpacingScale(preset, density), [preset, density]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">
          Preset de spacing
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {(Object.keys(SPACING_PRESETS) as SpacingPresetKey[]).map((key) => {
            const p = SPACING_PRESETS[key];
            return (
              <button
                key={key}
                onClick={() => onChange({ spacingPreset: key })}
                className={`text-left p-3 rounded border transition ${
                  preset === key ? "bg-accent/10 border-accent" : "border-border hover:bg-accent/5"
                }`}
              >
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[11px] text-muted">{p.hint}</div>
                <div className="text-[10px] font-mono text-muted mt-1 truncate">
                  {p.values.slice(0, 6).join(" · ")}...
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">
          Densité (multiplicateur)
        </label>
        <div className="flex gap-1">
          {(Object.keys(DENSITY_MULTIPLIERS) as DensityKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onChange({ spacingDensity: key })}
              className={`flex-1 h-9 text-sm rounded border transition ${
                density === key
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {key} (×{DENSITY_MULTIPLIERS[key]})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card/60 border border-border rounded-lg p-4 space-y-1.5">
        {scale.values.map((v, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-muted w-10 shrink-0">{v}px</span>
            <div className="flex-1 flex items-center gap-1">
              <div className="h-3 bg-accent rounded" style={{ width: `${v}px` }} />
              <span className="text-[10px] text-muted">space-{i}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RADIUS ─────────────────────────────────────────────────────────────────

function RadiusPicker({
  selected,
  onChange,
}: {
  selected: RadiusKey;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {(Object.keys(RADIUS_PRESETS) as RadiusKey[]).map((key) => {
          const r = RADIUS_PRESETS[key];
          return (
            <button
              key={key}
              onClick={() => onChange({ radius: key })}
              className={`p-2 rounded border transition flex flex-col items-center gap-1.5 ${
                selected === key ? "bg-accent/10 border-accent" : "border-border hover:bg-accent/5"
              }`}
            >
              <div
                className="w-12 h-12 bg-accent"
                style={{ borderRadius: r.value === 9999 ? "9999px" : `${r.value}px` }}
              />
              <span className="text-[10px] font-medium">{key}</span>
              <span className="text-[10px] font-mono text-muted">
                {r.value === 9999 ? "∞" : `${r.value}px`}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-muted">
        Sélectionné : <strong>{selected}</strong> · {RADIUS_PRESETS[selected].hint}
      </div>
    </div>
  );
}

// ─── SHADOWS ────────────────────────────────────────────────────────────────

function ShadowPicker({
  selected,
  onChange,
}: {
  selected: ShadowKey;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(SHADOW_PRESETS) as ShadowKey[]).map((key) => {
          const s = SHADOW_PRESETS[key];
          return (
            <button
              key={key}
              onClick={() => onChange({ shadow: key })}
              className={`p-3 rounded border transition flex flex-col items-center gap-2 ${
                selected === key ? "bg-accent/10 border-accent" : "border-border hover:bg-accent/5"
              }`}
            >
              <div
                className="w-16 h-16 bg-card rounded-lg border border-border/50"
                style={{ boxShadow: s.value }}
              />
              <span className="text-[10px] font-medium">{key}</span>
              <span className="text-[10px] text-muted text-center leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-muted">
        Sélectionné : <strong>{selected}</strong> · {SHADOW_PRESETS[selected].hint}
      </div>
    </div>
  );
}

// ─── ORCHESTRATEUR ──────────────────────────────────────────────────────────

type SubTab = "typo" | "fonts" | "spacing" | "radius" | "shadow" | "components";

const TOKEN_TABS: { key: SubTab; label: string; emoji: string; hint: string; helpKey?: HelpKey }[] = [
  { key: "typo", label: "Typographie", emoji: "Aa", hint: "Échelle modulaire de tailles", helpKey: "ratio" },
  { key: "fonts", label: "Fonts", emoji: "𝐅", hint: "Pairing heading + body + mono", helpKey: "fontPairing" },
  { key: "spacing", label: "Espacement", emoji: "↔️", hint: "Grille 4 ou 8 + densité", helpKey: "density" },
  { key: "radius", label: "Radius", emoji: "◔", hint: "Arrondis des coins (global)", helpKey: "radius" },
  { key: "shadow", label: "Ombres", emoji: "▓", hint: "Élévation visuelle (globale)", helpKey: "shadow" },
  { key: "components", label: "Composants", emoji: "🧩", hint: "Override radius + shadow par composant" },
];

// ─── COMPONENTS (overrides par composant) ───────────────────────────────────

const COMPONENT_LABELS: Record<keyof ComponentTokens, { label: string; emoji: string; hint: string }> = {
  buttonPrimary: { label: "Bouton primary", emoji: "🔘", hint: "Le CTA principal" },
  buttonSecondary: { label: "Bouton secondary", emoji: "⚪", hint: "Actions secondaires, ghost buttons" },
  card: { label: "Card", emoji: "🃏", hint: "Conteneur d'éléments" },
  input: { label: "Input / Textarea", emoji: "📝", hint: "Champs de saisie" },
  modal: { label: "Modal / Popover", emoji: "🪟", hint: "Dialogs flottants" },
};

// Rendu preview réel de chaque type de composant
function ComponentPreview({
  componentKey,
  tokens,
  colors,
}: {
  componentKey: keyof ComponentTokens;
  tokens: TokensState;
  colors: { bg: string; text: string; accent: string; secondary: string };
}) {
  const override = tokens.components[componentKey];
  const effectiveRadius = override.radius ?? tokens.radius;
  const effectiveShadow = override.shadow ?? tokens.shadow;
  const radiusPx = RADIUS_PRESETS[effectiveRadius].value;
  const radiusCss = radiusPx === 9999 ? "9999px" : `${radiusPx}px`;
  const shadowCss = SHADOW_PRESETS[effectiveShadow].value;

  if (componentKey === "buttonPrimary") {
    return (
      <button
        style={{
          background: colors.accent,
          color: colors.bg,
          borderRadius: radiusCss,
          boxShadow: shadowCss,
          fontWeight: 600,
          fontSize: 14,
          padding: "8px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Commencer →
      </button>
    );
  }
  if (componentKey === "buttonSecondary") {
    return (
      <button
        style={{
          background: "transparent",
          color: colors.text,
          border: `1px solid ${colors.secondary || colors.text}`,
          borderRadius: radiusCss,
          boxShadow: shadowCss,
          fontWeight: 600,
          fontSize: 14,
          padding: "8px 20px",
          cursor: "pointer",
        }}
      >
        En savoir plus
      </button>
    );
  }
  if (componentKey === "card") {
    return (
      <div
        style={{
          background: colors.bg,
          color: colors.text,
          borderRadius: radiusCss,
          boxShadow: shadowCss,
          border: `1px solid ${colors.secondary || colors.text}33`,
          padding: 16,
          minWidth: 200,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Titre de la card</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Un paragraphe qui illustre le contenu typique d&apos;une card.
        </div>
      </div>
    );
  }
  if (componentKey === "input") {
    return (
      <div style={{ minWidth: 200 }}>
        <label style={{ fontSize: 11, color: colors.text, opacity: 0.75, display: "block", marginBottom: 4 }}>
          Ton email
        </label>
        <input
          type="text"
          placeholder="nom@exemple.com"
          style={{
            width: "100%",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.secondary || colors.text}44`,
            borderRadius: radiusCss,
            boxShadow: shadowCss,
            padding: "8px 12px",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>
    );
  }
  // modal
  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        borderRadius: radiusCss,
        boxShadow: shadowCss,
        border: `1px solid ${colors.secondary || colors.text}33`,
        padding: 20,
        minWidth: 240,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Confirmation</div>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
        Exemple de modal flottant (dialog / popover).
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          style={{
            padding: "6px 14px",
            fontSize: 12,
            background: "transparent",
            color: colors.text,
            border: `1px solid ${colors.secondary || colors.text}44`,
            borderRadius: Math.max(0, radiusPx - 4) + "px",
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
        <button
          style={{
            padding: "6px 14px",
            fontSize: 12,
            background: colors.accent,
            color: colors.bg,
            border: "none",
            borderRadius: Math.max(0, radiusPx - 4) + "px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Confirmer
        </button>
      </div>
    </div>
  );
}

function ComponentOverrideRow({
  componentKey,
  tokens,
  colors,
  onChange,
}: {
  componentKey: keyof ComponentTokens;
  tokens: TokensState;
  colors: { bg: string; text: string; accent: string; secondary: string };
  onChange: (patch: Partial<TokensState>) => void;
}) {
  const override = tokens.components[componentKey];
  const labelInfo = COMPONENT_LABELS[componentKey];

  function updateOverride(patch: Partial<ComponentOverride>) {
    onChange({
      components: {
        ...tokens.components,
        [componentKey]: { ...override, ...patch },
      },
    });
  }

  return (
    <div className="bg-card/40 border border-border rounded-lg p-4 space-y-3">
      <div>
        <h4 className="font-semibold text-sm">
          {labelInfo.emoji} {labelInfo.label}
        </h4>
        <p className="text-[11px] text-muted">{labelInfo.hint}</p>
      </div>

      {/* Vrai preview du composant */}
      <div
        className="flex items-center justify-center p-6 rounded-lg border border-dashed border-border"
        style={{ background: `${colors.bg}` }}
      >
        <ComponentPreview componentKey={componentKey} tokens={tokens} colors={colors} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Radius
          </label>
          <select
            value={override.radius ?? "__inherit__"}
            onChange={(e) =>
              updateOverride({
                radius: e.target.value === "__inherit__" ? null : (e.target.value as RadiusKey),
              })
            }
            className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
          >
            <option value="__inherit__">Hériter ({tokens.radius})</option>
            {(Object.keys(RADIUS_PRESETS) as RadiusKey[]).map((k) => (
              <option key={k} value={k}>
                {k} ({RADIUS_PRESETS[k].value === 9999 ? "pilule" : `${RADIUS_PRESETS[k].value}px`})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Shadow
          </label>
          <select
            value={override.shadow ?? "__inherit__"}
            onChange={(e) =>
              updateOverride({
                shadow: e.target.value === "__inherit__" ? null : (e.target.value as ShadowKey),
              })
            }
            className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
          >
            <option value="__inherit__">Hériter ({tokens.shadow})</option>
            {(Object.keys(SHADOW_PRESETS) as ShadowKey[]).map((k) => (
              <option key={k} value={k}>
                {k} — {SHADOW_PRESETS[k].label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ComponentsPicker({
  tokens,
  onChange,
  selectedColors,
}: {
  tokens: TokensState;
  onChange: (patch: Partial<TokensState>) => void;
  selectedColors: { role: string; hex: string }[];
}) {
  // Fallback couleurs si pas de mariage défini
  const bg = selectedColors[0]?.hex ?? "#F2EDE8";
  const text = selectedColors[1]?.hex ?? "#1a1a1a";
  const accent = selectedColors[2]?.hex ?? "#7C6A4F";
  const secondary = selectedColors[3]?.hex ?? "#d4cbc0";
  const colors = { bg, text, accent, secondary };

  return (
    <div className="space-y-4">
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">À quoi ça sert ?</strong> Par défaut, tous tes
        composants héritent du radius + shadow globaux. Ici tu peux override chaque composant
        indépendamment (ex : bouton primary avec shadow marquée, inputs sans shadow).
        <br />
        Les previews utilisent les couleurs de ton{" "}
        {selectedColors.length >= 2 ? (
          <strong>mariage</strong>
        ) : (
          <strong>mariage</strong>
        )}{" "}
        {selectedColors.length < 2 && (
          <span>
            — <span className="text-amber-600">sélectionne au moins bg + text dans le bloc 6</span>
          </span>
        )}
        .
      </div>
      {(Object.keys(tokens.components) as Array<keyof ComponentTokens>).map((key) => (
        <ComponentOverrideRow
          key={key}
          componentKey={key}
          tokens={tokens}
          colors={colors}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

// ─── GRADIENTS ──────────────────────────────────────────────────────────────

function GradientsPicker({
  gradient,
  onChange,
}: {
  gradient: GradientState;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  const [copied, setCopied] = useState(false);
  const css = gradientToCss(gradient);

  function updateGradient(patch: Partial<GradientState>) {
    onChange({ gradient: { ...gradient, ...patch } });
  }

  function updateStop(index: number, patch: Partial<typeof gradient.stops[0]>) {
    const stops = gradient.stops.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateGradient({ stops });
  }

  function addStop() {
    if (gradient.stops.length >= 6) return;
    const last = gradient.stops[gradient.stops.length - 1];
    const newPos = Math.min(100, last.position + 25);
    updateGradient({
      stops: [...gradient.stops, { color: "#888888", position: newPos }],
    });
  }

  function removeStop(index: number) {
    if (gradient.stops.length <= 2) return;
    updateGradient({ stops: gradient.stops.filter((_, i) => i !== index) });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`background: ${css};`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">Presets</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => updateGradient(p.value)}
              className="p-0.5 rounded-lg border border-border hover:border-accent transition overflow-hidden"
              title={p.name}
            >
              <div
                className="h-16 w-full rounded"
                style={{ background: gradientToCss(p.value) }}
              />
              <div className="text-[10px] font-medium py-1 text-center">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Type de gradient */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">Type</label>
        <div className="flex gap-1">
          {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
            <button
              key={t}
              onClick={() => updateGradient({ type: t })}
              className={`flex-1 h-9 text-sm rounded border transition capitalize ${
                gradient.type === t
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Angle (linear/conic only) */}
      {gradient.type !== "radial" && (
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted flex items-center justify-between">
            <span>{gradient.type === "linear" ? "Angle" : "Start angle"}</span>
            <span className="font-mono normal-case">{gradient.angle}°</span>
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={15}
            value={gradient.angle}
            onChange={(e) => updateGradient({ angle: parseInt(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
      )}

      {/* Stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-muted">
            Color stops ({gradient.stops.length})
          </label>
          <button
            onClick={addStop}
            disabled={gradient.stops.length >= 6}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-accent/10 disabled:opacity-50"
          >
            + Stop
          </button>
        </div>
        <div className="space-y-2">
          {gradient.stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="h-9 w-14 rounded border border-border cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="w-24 h-9 px-2 text-xs font-mono rounded border border-border bg-card"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={stop.position}
                  onChange={(e) => updateStop(i, { position: parseInt(e.target.value) })}
                  className="w-full accent-accent"
                />
              </div>
              <span className="w-12 text-xs font-mono text-muted text-right">{stop.position}%</span>
              <button
                onClick={() => removeStop(i)}
                disabled={gradient.stops.length <= 2}
                className="w-8 h-8 rounded border border-border hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition"
                title="Retirer ce stop"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">Preview</label>
        <div
          className="h-32 rounded-xl border border-border"
          style={{ background: css }}
        />
      </div>

      {/* Export CSS */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-muted">CSS</label>
        <div className="flex gap-2">
          <code className="flex-1 px-3 py-2 text-xs font-mono rounded border border-border bg-card overflow-x-auto whitespace-nowrap">
            background: {css};
          </code>
          <button
            onClick={handleCopy}
            className="text-xs px-3 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
          >
            {copied ? "✓ Copié" : "📋 Copier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FONTS ──────────────────────────────────────────────────────────────────

type FontRole = "heading" | "body" | "mono";

function FontSelector({
  role,
  currentFont,
  onPick,
}: {
  role: FontRole;
  currentFont: string | undefined;
  onPick: (family: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<FontCategory | "all">(
    role === "mono" ? "mono" : "all"
  );
  const [customInput, setCustomInput] = useState("");

  const filtered = useMemo(() => {
    return FONTS_LIBRARY.filter((f) => {
      if (catFilter !== "all" && f.category !== catFilter) return false;
      if (search && !f.family.toLowerCase().includes(search.toLowerCase())) return false;
      // Pour mono, ne montrer que les mono fonts
      if (role === "mono" && f.category !== "mono") return false;
      return true;
    });
  }, [search, catFilter, role]);

  // Charge les fonts visibles (lazy)
  useEffect(() => {
    for (const f of filtered.slice(0, 20)) loadSingleFont(f);
  }, [filtered]);

  function handleAddCustom() {
    const family = customInput.trim();
    if (!family) return;
    loadFontByName(family);
    onPick(family);
    setCustomInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold uppercase tracking-wider min-w-[70px]">
          {role === "heading" ? "Heading" : role === "body" ? "Body" : "Mono"}
        </span>
        <span
          className="flex-1 min-w-[150px] px-3 py-1.5 rounded border border-border bg-card text-sm font-mono"
          style={{ fontFamily: currentFont ?? "system-ui" }}
        >
          {currentFont ?? "system-ui"}
        </span>
      </div>

      {role !== "mono" && (
        <div className="flex flex-wrap gap-1">
          {(["all", "sans", "serif", "display"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`text-[11px] px-2 py-1 rounded-full border transition ${
                catFilter === cat
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {cat === "all" ? "Tous" : fontCategoryLabel(cat as FontCategory)}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une font..."
        className="w-full h-8 px-3 text-sm rounded border border-border bg-card"
      />

      <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
        {filtered.length === 0 && (
          <div className="p-3 text-xs text-muted text-center">Aucune font trouvée.</div>
        )}
        {filtered.map((f) => {
          const isSelected = currentFont === f.family;
          return (
            <button
              key={f.family}
              onClick={() => onPick(f.family)}
              className={`w-full text-left p-2.5 transition flex items-baseline justify-between gap-2 ${
                isSelected ? "bg-accent/10" : "hover:bg-accent/5"
              }`}
            >
              <span
                className="truncate"
                style={{ fontFamily: `"${f.family}", ${role === "mono" ? "monospace" : "sans-serif"}` }}
              >
                <strong className="text-base">{f.family}</strong>{" "}
                <span className="text-muted text-xs">— Aa Bb 123</span>
              </span>
              <span className="text-[10px] text-muted uppercase shrink-0">
                {f.category}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCustom();
          }}
          placeholder="Ex: Caveat, Bebas Neue..."
          className="flex-1 h-8 px-3 text-sm rounded border border-border bg-card"
        />
        <button
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          className="text-xs px-3 h-8 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
          title="Charger une Google Font par nom"
        >
          + Google Font
        </button>
      </div>
    </div>
  );
}

function FontsPicker({
  tokens,
  onChange,
}: {
  tokens: TokensState;
  onChange: (patch: Partial<TokensState>) => void;
}) {
  const [styleFilter, setStyleFilter] = useState<FontPairing["style"] | "all">("all");
  const filtered =
    styleFilter === "all" ? FONT_PAIRINGS : FONT_PAIRINGS.filter((p) => p.style === styleFilter);

  useEffect(() => {
    for (const p of filtered) loadFontPairing(p);
  }, [filtered]);

  function updateCustomFont(role: FontRole, family: string) {
    onChange({
      customFonts: { ...tokens.customFonts, [role]: family },
    });
  }

  return (
    <div className="space-y-4">
      {/* Toggle mode */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ fontMode: "pairing" })}
          className={`text-sm px-4 py-2 rounded border transition ${
            tokens.fontMode === "pairing"
              ? "bg-accent text-white border-accent"
              : "border-border hover:bg-accent/10"
          }`}
        >
          🎨 Pairings pré-faits
        </button>
        <button
          onClick={() => onChange({ fontMode: "custom" })}
          className={`text-sm px-4 py-2 rounded border transition ${
            tokens.fontMode === "custom"
              ? "bg-accent text-white border-accent"
              : "border-border hover:bg-accent/10"
          }`}
        >
          🎛️ Custom (par niveau)
        </button>
      </div>

      {tokens.fontMode === "pairing" && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStyleFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                styleFilter === "all"
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              Tous
            </button>
            {FONT_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyleFilter(s.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  styleFilter === s.value
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((p) => {
              const isSelected = p.id === tokens.fontPairingId;
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ fontPairingId: p.id })}
                  className={`text-left p-4 rounded-lg border transition ${
                    isSelected ? "bg-accent/10 border-accent" : "border-border hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="text-[10px] text-muted uppercase">{p.style}</span>
                  </div>
                  <div
                    className="text-xl font-bold mb-1"
                    style={{
                      fontFamily: `"${p.heading.family}", ${p.heading.fallback}`,
                      fontWeight: p.heading.weights[p.heading.weights.length - 1],
                    }}
                  >
                    Titre exemple
                  </div>
                  <div
                    className="text-sm mb-1"
                    style={{
                      fontFamily: `"${p.body.family}", ${p.body.fallback}`,
                      fontWeight: 400,
                    }}
                  >
                    Le renard brun saute par-dessus le chien paresseux. 1234567890.
                  </div>
                  {p.mono && (
                    <div
                      className="text-xs text-muted"
                      style={{ fontFamily: `"${p.mono.family}", ${p.mono.fallback}` }}
                    >
                      const x = 42; // mono font
                    </div>
                  )}
                  <div className="text-[10px] text-muted mt-2">{p.hint}</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {tokens.fontMode === "custom" && (
        <div className="space-y-5">
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Mode Custom :</strong> choisis chaque niveau
            indépendamment. Pour une Google Font qui n&apos;est pas dans la liste, tape son nom
            exact dans le champ du bas.
          </div>
          <FontSelector
            role="heading"
            currentFont={tokens.customFonts.heading}
            onPick={(f) => updateCustomFont("heading", f)}
          />
          <FontSelector
            role="body"
            currentFont={tokens.customFonts.body}
            onPick={(f) => updateCustomFont("body", f)}
          />
          <FontSelector
            role="mono"
            currentFont={tokens.customFonts.mono}
            onPick={(f) => updateCustomFont("mono", f)}
          />
        </div>
      )}
    </div>
  );
}

export default function TokensBlock({
  tokens,
  onChange,
  selectedColors = [],
}: {
  tokens: TokensState;
  onChange: (patch: Partial<TokensState>) => void;
  selectedColors?: { role: string; hex: string }[];
}) {
  const [activeTab, setActiveTab] = useState<SubTab>("typo");
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        6. Tokens visuels
        <span className="text-muted font-normal text-sm">
          (typo · fonts · spacing · radius · shadow · composants)
        </span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher les tokens visuels (4 outils)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">À quoi ça sert ?</strong> Ces 4 outils définissent
            le reste de ton design system (au-delà des couleurs). Une fois fixés, ton app aura un
            look cohérent : tailles harmonieuses, espacements réguliers, arrondis identiques,
            ombres uniformes. <strong>Tes choix ici sont appliqués dans le bloc 5 Preview du
            mariage</strong> pour voir le rendu réel.
          </div>

          <div className="flex flex-wrap gap-2">
            {TOKEN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                <span className="font-mono">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5">
            <p className="text-xs text-muted mb-4 flex items-center gap-1">
              {TOKEN_TABS.find((t) => t.key === activeTab)?.hint}
              {TOKEN_TABS.find((t) => t.key === activeTab)?.helpKey && (
                <Help topic={TOKEN_TABS.find((t) => t.key === activeTab)!.helpKey!} />
              )}
            </p>
            {activeTab === "typo" && (
              <TypographyPicker
                baseSize={tokens.typoBaseSize}
                ratio={tokens.typoRatio}
                onChange={onChange}
              />
            )}
            {activeTab === "fonts" && <FontsPicker tokens={tokens} onChange={onChange} />}
            {activeTab === "spacing" && (
              <SpacingPicker
                preset={tokens.spacingPreset}
                density={tokens.spacingDensity}
                onChange={onChange}
              />
            )}
            {activeTab === "radius" && (
              <RadiusPicker selected={tokens.radius} onChange={onChange} />
            )}
            {activeTab === "shadow" && (
              <ShadowPicker selected={tokens.shadow} onChange={onChange} />
            )}
            {activeTab === "components" && (
              <ComponentsPicker
                tokens={tokens}
                onChange={onChange}
                selectedColors={selectedColors}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
