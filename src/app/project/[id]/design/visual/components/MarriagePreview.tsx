"use client";

import { useState } from "react";
import { contrastRatio } from "@/lib/design/oklch";
import {
  RADIUS_PRESETS,
  SHADOW_PRESETS,
  DENSITY_MULTIPLIERS,
  generateTypoScale,
} from "@/lib/design/tokens";
import { resolveFonts, type TokensState } from "@/app/design-spike/tokens-block";
import MarriageChip from "./MarriageChip";
import { ratioVerdict, type SelectedShade } from "./shared";

function MarriageContrastReport({ selected }: { selected: SelectedShade[] }) {
  if (selected.length < 2) return null;
  const [bg, text, accent, secondary] = selected.map((s) => s.hex);

  const pairs: { label: string; a: string; b: string; hint: string }[] = [];
  if (bg && text)
    pairs.push({
      label: "Text / Background",
      a: text,
      b: bg,
      hint: "AA requis (≥4.5) pour texte lisible",
    });
  if (bg && accent)
    pairs.push({
      label: "Accent / Background",
      a: accent,
      b: bg,
      hint: "AA-Large requis (≥3) pour bouton CTA",
    });
  if (accent && text)
    pairs.push({
      label: "Text / Accent",
      a: text,
      b: accent,
      hint: "Si texte sur bouton accent — AA requis (≥4.5)",
    });
  if (bg && secondary)
    pairs.push({
      label: "Secondary / Background",
      a: secondary,
      b: bg,
      hint: "AA-Large requis (≥3) pour bordure visible",
    });

  return (
    <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold text-sm">Contrôle contraste WCAG</h4>
        <span className="text-[11px] text-muted">
          Clic sur une couleur = color picker pour ajuster
        </span>
      </div>
      <div className="space-y-1.5">
        {pairs.map((p) => {
          const ratio = contrastRatio(p.a, p.b);
          const verdict = ratioVerdict(ratio);
          return (
            <div key={p.label} className="flex items-center gap-3 text-sm flex-wrap">
              <div className="flex items-center gap-1.5 w-48 shrink-0">
                <div
                  className="w-5 h-5 rounded border border-border"
                  style={{ background: p.b }}
                  title={`bg ${p.b}`}
                />
                <div
                  className="w-5 h-5 rounded border border-border"
                  style={{ background: p.a }}
                  title={`fg ${p.a}`}
                />
                <span className="font-medium">{p.label}</span>
              </div>
              <span className="font-mono text-xs text-muted w-16 shrink-0">
                {ratio.toFixed(2)}
              </span>
              <span className={`text-xs ${verdict.color} w-24 shrink-0`}>{verdict.label}</span>
              <span className="text-xs text-muted hidden lg:inline">{p.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MarriagePreview({
  selected,
  onRemove,
  onMove,
  onClear,
  onChangeColor,
  tokens,
}: {
  selected: SelectedShade[];
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
  onChangeColor: (id: string, newHex: string) => void;
  tokens: TokensState;
}) {
  const [darkMode, setDarkMode] = useState(false);

  if (selected.length === 0) {
    return (
      <div className="bg-card/60 border border-dashed border-border rounded-2xl p-8 text-center text-sm text-muted">
        Clique sur des shades (palettes ci-dessus) ou charge un combo pour voir leur mariage.
      </div>
    );
  }

  const [bg, text, accent, secondary] = darkMode
    ? [selected[1]?.hex, selected[0]?.hex, selected[2]?.hex, selected[3]?.hex]
    : [selected[0]?.hex, selected[1]?.hex, selected[2]?.hex, selected[3]?.hex];

  const cardRadius = tokens.components.card.radius ?? tokens.radius;
  const cardShadow = tokens.components.card.shadow ?? tokens.shadow;
  const btnPrimaryRadius = tokens.components.buttonPrimary.radius ?? tokens.radius;
  const btnPrimaryShadow = tokens.components.buttonPrimary.shadow ?? tokens.shadow;
  const btnSecondaryRadius = tokens.components.buttonSecondary.radius ?? tokens.radius;
  const btnSecondaryShadow = tokens.components.buttonSecondary.shadow ?? tokens.shadow;
  const cardRadiusPx = RADIUS_PRESETS[cardRadius].value;
  const radiusCss = cardRadiusPx === 9999 ? "9999px" : `${cardRadiusPx}px`;
  const btnPrimaryRadiusPx = RADIUS_PRESETS[btnPrimaryRadius].value;
  const btnPrimaryRadiusCss =
    btnPrimaryRadiusPx === 9999 ? "9999px" : `${btnPrimaryRadiusPx}px`;
  const btnSecondaryRadiusPx = RADIUS_PRESETS[btnSecondaryRadius].value;
  const btnSecondaryRadiusCss =
    btnSecondaryRadiusPx === 9999 ? "9999px" : `${btnSecondaryRadiusPx}px`;
  const innerRadiusCss = cardRadiusPx === 9999 ? "9999px" : `${Math.max(0, cardRadiusPx - 4)}px`;
  const shadowCss = SHADOW_PRESETS[cardShadow].value;
  const btnPrimaryShadowCss = SHADOW_PRESETS[btnPrimaryShadow].value;
  const btnSecondaryShadowCss = SHADOW_PRESETS[btnSecondaryShadow].value;
  const densityMult = DENSITY_MULTIPLIERS[tokens.spacingDensity];
  const padContainer = Math.round(24 * densityMult);
  const padButton = Math.round(8 * densityMult);
  const padButtonX = Math.round(16 * densityMult);
  const gapItems = Math.round(16 * densityMult);
  const typo = generateTypoScale(tokens.typoBaseSize, tokens.typoRatio);
  const titleSize = typo.sizes.find((s) => s.name === "xl")?.px ?? 24;
  const titleLh = typo.sizes.find((s) => s.name === "xl")?.lineHeight ?? 1.3;
  const bodySize = typo.sizes.find((s) => s.name === "base")?.px ?? 16;
  const bodyLh = typo.sizes.find((s) => s.name === "base")?.lineHeight ?? 1.6;
  const buttonSize = typo.sizes.find((s) => s.name === "sm")?.px ?? 14;
  const fonts = resolveFonts(tokens);
  const headingFont = fonts.heading;
  const bodyFont = fonts.body;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold">
          Mariage — {selected.length} couleur(s){" "}
          <span className="text-muted font-normal text-sm">(réorganise avec ◀ ▶)</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition flex items-center gap-1.5"
            title={darkMode ? "Passer en mode clair" : "Passer en mode sombre (swap bg↔text)"}
          >
            {darkMode ? "🌙 Dark" : "🌞 Light"}
          </button>
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
          >
            Tout retirer
          </button>
        </div>
      </div>

      {/* Chips */}
      <div className="flex gap-4 flex-wrap">
        {selected.map((s, index) => (
          <MarriageChip
            key={s.id}
            shade={s}
            index={index}
            total={selected.length}
            onRemove={() => onRemove(s.id)}
            onMoveLeft={() => onMove(index, index - 1)}
            onMoveRight={() => onMove(index, index + 1)}
            onChangeColor={(newHex) => onChangeColor(s.id, newHex)}
          />
        ))}
      </div>

      {/* Rapport WCAG */}
      <MarriageContrastReport selected={selected} />

      {/* Mockup live */}
      {selected.length >= 2 && bg && text && (
        <div
          className="border border-border transition"
          style={{
            background: bg,
            color: text,
            borderRadius: radiusCss,
            boxShadow: shadowCss,
            padding: `${padContainer}px`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: `${gapItems}px` }}>
            <div>
              <h4
                style={{
                  color: text,
                  fontSize: `${titleSize}px`,
                  lineHeight: titleLh,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: `${Math.round(8 * densityMult)}px`,
                }}
              >
                Exemple de mariage
              </h4>
              <p
                style={{
                  color: text,
                  fontSize: `${bodySize}px`,
                  lineHeight: bodyLh,
                  fontFamily: bodyFont,
                  opacity: 0.8,
                  margin: 0,
                }}
              >
                Mockup live appliquant tes tokens : couleurs, typo, fonts, spacing, radius, shadow.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${Math.round(12 * densityMult)}px`,
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  background: accent ?? text,
                  color: bg,
                  borderRadius: btnPrimaryRadiusCss,
                  boxShadow: btnPrimaryShadowCss,
                  fontSize: `${buttonSize}px`,
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  padding: `${padButton}px ${padButtonX}px`,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Action principale
              </button>
              {secondary && (
                <button
                  style={{
                    borderColor: secondary,
                    color: text,
                    background: "transparent",
                    borderRadius: btnSecondaryRadiusCss,
                    boxShadow: btnSecondaryShadowCss,
                    fontSize: `${buttonSize}px`,
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    padding: `${padButton}px ${padButtonX}px`,
                    border: `1px solid ${secondary}`,
                    cursor: "pointer",
                  }}
                >
                  Action secondaire
                </button>
              )}
            </div>
            {accent && (
              <div
                style={{
                  background: `color-mix(in oklch, ${accent} 15%, ${bg})`,
                  color: text,
                  border: `1px solid ${accent}`,
                  borderRadius: innerRadiusCss,
                  padding: `${Math.round(16 * densityMult)}px`,
                  fontSize: `${bodySize}px`,
                  fontFamily: bodyFont,
                  lineHeight: bodyLh,
                  boxShadow: shadowCss,
                }}
              >
                Une card avec fond dérivé de l&apos;accent + bordure + ombre.
              </div>
            )}

            {/* Input + label (shadcn-like) */}
            {accent && (
              <div style={{ display: "flex", flexDirection: "column", gap: `${Math.round(4 * densityMult)}px` }}>
                <label
                  style={{
                    color: text,
                    fontSize: `${Math.max(11, buttonSize - 2)}px`,
                    fontFamily: bodyFont,
                    fontWeight: 500,
                    opacity: 0.9,
                  }}
                >
                  Email
                </label>
                <input
                  readOnly
                  defaultValue="anthony@mindeck.app"
                  style={{
                    background: bg,
                    color: text,
                    border: `1px solid ${secondary ?? accent}`,
                    borderRadius: btnSecondaryRadiusCss,
                    padding: `${Math.round(8 * densityMult)}px ${Math.round(12 * densityMult)}px`,
                    fontSize: `${bodySize}px`,
                    fontFamily: bodyFont,
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    color: text,
                    opacity: 0.6,
                    fontSize: `${Math.max(10, buttonSize - 4)}px`,
                    fontFamily: bodyFont,
                  }}
                >
                  Helper text — guide discret pour l&apos;utilisateur
                </span>
              </div>
            )}

            {/* Badges (shadcn-like) */}
            {accent && (
              <div
                style={{
                  display: "flex",
                  gap: `${Math.round(8 * densityMult)}px`,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    background: accent,
                    color: bg,
                    fontSize: `${Math.max(10, buttonSize - 4)}px`,
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    padding: `${Math.round(2 * densityMult)}px ${Math.round(8 * densityMult)}px`,
                    borderRadius: "9999px",
                  }}
                >
                  Default
                </span>
                <span
                  style={{
                    background: "transparent",
                    color: text,
                    border: `1px solid ${secondary ?? accent}`,
                    fontSize: `${Math.max(10, buttonSize - 4)}px`,
                    fontFamily: bodyFont,
                    fontWeight: 500,
                    padding: `${Math.round(2 * densityMult)}px ${Math.round(8 * densityMult)}px`,
                    borderRadius: "9999px",
                  }}
                >
                  Outline
                </span>
                <span
                  style={{
                    background: `color-mix(in oklch, ${accent} 20%, ${bg})`,
                    color: accent,
                    fontSize: `${Math.max(10, buttonSize - 4)}px`,
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    padding: `${Math.round(2 * densityMult)}px ${Math.round(8 * densityMult)}px`,
                    borderRadius: "9999px",
                  }}
                >
                  Secondary
                </span>
              </div>
            )}

            {/* Alert (shadcn-like) */}
            {accent && (
              <div
                role="alert"
                style={{
                  background: `color-mix(in oklch, ${accent} 10%, ${bg})`,
                  color: text,
                  border: `1px solid ${accent}`,
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: innerRadiusCss,
                  padding: `${Math.round(12 * densityMult)}px ${Math.round(16 * densityMult)}px`,
                  fontSize: `${bodySize}px`,
                  fontFamily: bodyFont,
                  lineHeight: bodyLh,
                  display: "flex",
                  gap: `${Math.round(10 * densityMult)}px`,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: accent, fontWeight: 700 }}>ℹ</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: `${Math.round(2 * densityMult)}px` }}>
                    Info
                  </div>
                  <div style={{ opacity: 0.85 }}>
                    Les composants de cette preview utilisent tes couleurs + tokens actifs.
                  </div>
                </div>
              </div>
            )}

            {/* Tabs (shadcn-like) */}
            {secondary && (
              <div
                style={{
                  display: "flex",
                  gap: `${Math.round(4 * densityMult)}px`,
                  padding: `${Math.round(4 * densityMult)}px`,
                  background: `color-mix(in oklch, ${text} 8%, ${bg})`,
                  borderRadius: innerRadiusCss,
                  width: "fit-content",
                }}
              >
                {["Tab 1", "Tab 2", "Tab 3"].map((label, i) => (
                  <div
                    key={label}
                    style={{
                      background: i === 0 ? bg : "transparent",
                      color: text,
                      fontSize: `${Math.max(11, buttonSize - 1)}px`,
                      fontFamily: bodyFont,
                      fontWeight: i === 0 ? 600 : 500,
                      padding: `${Math.round(4 * densityMult)}px ${Math.round(12 * densityMult)}px`,
                      borderRadius: btnSecondaryRadiusCss,
                      opacity: i === 0 ? 1 : 0.7,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
