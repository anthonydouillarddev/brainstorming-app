"use client";

import { useState } from "react";
import {
  GRADIENT_PRESETS,
  gradientToCss,
  type GradientState,
  type GradientType,
} from "@/lib/design/tokens";
import {
  generateNeutralPalette,
  generateSemanticPalette,
  DEFAULT_SEMANTIC_HUES,
  type PaletteShade,
} from "@/lib/design/oklch";

export interface GradientBlockProps {
  gradient: GradientState;
  onChange: (gradient: GradientState) => void;
  // Couleurs disponibles dans le design system pour alimenter les stops
  primaryPalette: PaletteShade[];
  primaryHex: string; // pour générer la palette neutrals à la volée
  selectedColors: { role: string; hex: string }[]; // couleurs du mariage
}

function ColorChip({
  hex,
  label,
  sublabel,
  onClick,
}: {
  hex: string;
  label?: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded border border-border hover:border-accent transition overflow-hidden shrink-0"
      title={`Cliquer pour utiliser ${hex}`}
    >
      <div className="w-8 h-8" style={{ background: hex }} />
      {(label || sublabel) && (
        <div className="text-[9px] font-mono text-center px-1 py-0.5 bg-card/50">
          {label ?? hex}
          {sublabel && <div className="text-muted text-[8px]">{sublabel}</div>}
        </div>
      )}
    </button>
  );
}

function ColorGroup({
  title,
  colors,
  onPick,
}: {
  title: string;
  colors: { hex: string; label?: string; sublabel?: string }[];
  onPick: (hex: string) => void;
}) {
  if (colors.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{title}</div>
      <div className="flex flex-wrap gap-1">
        {colors.map((c, i) => (
          <ColorChip
            key={`${c.hex}-${i}`}
            hex={c.hex}
            label={c.label}
            sublabel={c.sublabel}
            onClick={() => onPick(c.hex)}
          />
        ))}
      </div>
    </div>
  );
}

export default function GradientBlock({
  gradient,
  onChange,
  primaryPalette,
  primaryHex,
  selectedColors,
}: GradientBlockProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const neutrals = generateNeutralPalette(primaryHex, 0.5);
  const success = generateSemanticPalette(DEFAULT_SEMANTIC_HUES.success);
  const error = generateSemanticPalette(DEFAULT_SEMANTIC_HUES.error);
  const info = generateSemanticPalette(DEFAULT_SEMANTIC_HUES.info);
  const warning = generateSemanticPalette(DEFAULT_SEMANTIC_HUES.warning);

  const css = gradientToCss(gradient);

  function updateGradient(patch: Partial<GradientState>) {
    onChange({ ...gradient, ...patch });
  }

  function updateStop(index: number, patch: Partial<(typeof gradient.stops)[0]>) {
    const stops = gradient.stops.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateGradient({ stops });
  }

  function addStop() {
    if (gradient.stops.length >= 6) return;
    const last = gradient.stops[gradient.stops.length - 1];
    updateGradient({
      stops: [...gradient.stops, { color: "#888888", position: Math.min(100, last.position + 25) }],
    });
  }

  function removeStop(index: number) {
    if (gradient.stops.length <= 2) return;
    updateGradient({ stops: gradient.stops.filter((_, i) => i !== index) });
    if (activeStopIndex >= gradient.stops.length - 1) setActiveStopIndex(0);
  }

  function applyColorToActiveStop(hex: string) {
    updateStop(activeStopIndex, { color: hex });
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
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        5. Gradients
        <span className="text-muted font-normal text-sm">
          (linear · radial · conic)
        </span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher le bloc Gradients
        </button>
      )}

      {!collapsed && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-5">
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">À quoi ça sert ?</strong> Les gradients sont
            partout en 2026 : fond de hero, cards premium, boutons magiques, Mesh
            backgrounds... Ici tu construis ton gradient en utilisant les <strong>couleurs de
            ton design system</strong> (palette primary, neutrals, semantics, mariage) — pas
            des couleurs au pif.
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted">
              Presets
            </label>
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

          {/* Type */}
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

          {/* Angle */}
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

          {/* Stops éditables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted">
                Color stops ({gradient.stops.length}) — clic pour sélectionner, puis clic sur une couleur ci-dessous
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
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded border transition ${
                    activeStopIndex === i
                      ? "bg-accent/10 border-accent"
                      : "border-border bg-card/40 hover:bg-card/60"
                  }`}
                >
                  <button
                    onClick={() => setActiveStopIndex(i)}
                    className="shrink-0 text-xs font-semibold w-6 h-6 rounded-full border border-border flex items-center justify-center"
                    title="Activer ce stop pour le remplir avec une couleur ci-dessous"
                  >
                    {activeStopIndex === i ? "●" : i + 1}
                  </button>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(i, { color: e.target.value })}
                    className="h-8 w-12 rounded border border-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(i, { color: e.target.value })}
                    className="w-24 h-8 px-2 text-xs font-mono rounded border border-border bg-card"
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
                  <span className="w-12 text-xs font-mono text-muted text-right">
                    {stop.position}%
                  </span>
                  <button
                    onClick={() => removeStop(i)}
                    disabled={gradient.stops.length <= 2}
                    className="w-7 h-7 rounded border border-border hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition"
                    title="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Couleurs du design system pour alimenter les stops */}
          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <div className="text-sm font-semibold">Couleurs de ton design system</div>
              <div className="text-[11px] text-muted">
                Clic sur une couleur pour remplir le stop actif (n°{activeStopIndex + 1}).
              </div>
            </div>

            {/* Mariage (prioritaire) */}
            {selectedColors.length > 0 && (
              <ColorGroup
                title="Mariage (bloc 7)"
                colors={selectedColors.map((s) => ({
                  hex: s.hex,
                  label: s.role.slice(0, 3),
                  sublabel: s.hex,
                }))}
                onPick={applyColorToActiveStop}
              />
            )}

            <ColorGroup
              title="Palette primary"
              colors={primaryPalette.map((s) => ({
                hex: s.hex,
                label: String(s.name),
              }))}
              onPick={applyColorToActiveStop}
            />

            <ColorGroup
              title="Neutrals (gris teintés)"
              colors={neutrals.map((s) => ({
                hex: s.hex,
                label: String(s.name),
              }))}
              onPick={applyColorToActiveStop}
            />

            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Semantics
              </div>
              <div className="space-y-1.5">
                <ColorGroup
                  title="✅ Success"
                  colors={success.map((s) => ({ hex: s.hex, label: String(s.name) }))}
                  onPick={applyColorToActiveStop}
                />
                <ColorGroup
                  title="⚠️ Warning"
                  colors={warning.map((s) => ({ hex: s.hex, label: String(s.name) }))}
                  onPick={applyColorToActiveStop}
                />
                <ColorGroup
                  title="🚨 Error"
                  colors={error.map((s) => ({ hex: s.hex, label: String(s.name) }))}
                  onPick={applyColorToActiveStop}
                />
                <ColorGroup
                  title="💬 Info"
                  colors={info.map((s) => ({ hex: s.hex, label: String(s.name) }))}
                  onPick={applyColorToActiveStop}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted">
              Preview
            </label>
            <div
              className="h-40 rounded-xl border border-border"
              style={{ background: css }}
            />
          </div>

          {/* Export */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted">
              CSS
            </label>
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
      )}
    </div>
  );
}
