"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  generatePalette,
  SHADE_NAMES,
  contrastRatio,
  suggestFiveColors,
  type PaletteShade,
  type PaletteTuning,
} from "@/lib/design/oklch";
import { COLOR_COMBOS, COMBO_STYLES, type ColorCombo } from "@/lib/design/combos";
import {
  fetchSavedColors,
  updateSavedColors,
  fetchCustomCombos,
  createCustomCombo,
  deleteCustomComboById,
  type CustomComboRow,
} from "@/lib/design/colors-api";

const HEX_RE = /#?[0-9a-f]{6}/gi;

// Parse une saisie libre de hex ("#111, #222" ou "#111\n#222" ou "111 222")
// en tableau d'hex normalisés avec le "#" préfixe.
function parseHexList(input: string): string[] {
  const matches = input.match(HEX_RE) ?? [];
  return Array.from(
    new Set(matches.map((m) => (m.startsWith("#") ? m : `#${m}`).toLowerCase()))
  );
}

function rowToCombo(row: CustomComboRow): ColorCombo {
  return {
    id: row.id,
    name: row.name,
    style: row.style,
    colors: row.colors,
    note: row.note ?? undefined,
  };
}

const TEST_COLORS = [
  { name: "Moka Mindeck", hex: "#7C6A4F" },
  { name: "Caramel Mindeck dark", hex: "#C9956B" },
  { name: "Bleu tech (Linear)", hex: "#3B82F6" },
  { name: "Vert success", hex: "#10b981" },
  { name: "Rouge error", hex: "#ef4444" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Jaune (test gamut)", hex: "#eab308" },
];

// Rôles attribués aux couleurs dans le mariage, selon leur position.
// 5+ couleurs : rôles génériques "Couleur N".
const ROLES: { label: string; hint: string }[] = [
  { label: "Background", hint: "Le fond principal de ton interface" },
  { label: "Text", hint: "Le texte principal lu sur le background" },
  { label: "Accent", hint: "La couleur d'action (boutons, liens)" },
  { label: "Secondary", hint: "Une couleur secondaire (bordures, zones douces)" },
];

function roleFor(index: number): { label: string; hint: string } {
  return ROLES[index] ?? { label: `Couleur ${index + 1}`, hint: "Couleur additionnelle" };
}

interface SelectedShade {
  id: string; // unique (paletteHex-shadeName ou combo-id-i)
  hex: string;
  source?: string; // pour afficher "shade 500", "combo Vintage Sage", etc.
}

function badgeClass(ratio: number): string {
  if (ratio >= 7) return "text-emerald-600 font-semibold";
  if (ratio >= 4.5) return "text-green-600";
  if (ratio >= 3) return "text-amber-600";
  return "text-muted";
}

function ShadeCard({
  shade,
  isSelected,
  onToggle,
}: {
  shade: PaletteShade;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left space-y-1 transition ${
        isSelected ? "scale-105" : "hover:scale-[1.02]"
      }`}
      title={`${shade.css} — clic pour ajouter/retirer au mariage`}
    >
      <div
        className={`aspect-square rounded shadow-sm ${
          isSelected ? "ring-4 ring-accent ring-offset-2 ring-offset-card" : "border border-border"
        }`}
        style={{ background: shade.hex }}
      />
      <div className="text-[10px] font-mono space-y-0.5 leading-tight">
        <div className="font-semibold text-center">{shade.name}</div>
        <div className="text-muted text-center truncate">{shade.hex}</div>
        <div className="flex justify-between gap-1">
          <span className={badgeClass(shade.ratioVsWhite)}>W {shade.ratioVsWhite.toFixed(1)}</span>
          <span className={badgeClass(shade.ratioVsBlack)}>B {shade.ratioVsBlack.toFixed(1)}</span>
        </div>
      </div>
    </button>
  );
}

function PaletteRow({
  name,
  hex,
  tuning,
  selected,
  onToggleShade,
}: {
  name: string;
  hex: string;
  tuning?: PaletteTuning;
  selected: Set<string>;
  onToggleShade: (shade: SelectedShade) => void;
}) {
  const palette = useMemo(() => generatePalette(hex, tuning), [hex, tuning]);
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold">
          {name}{" "}
          <span className="text-muted font-normal">
            — <span className="font-mono text-sm">{hex}</span>
          </span>
        </h3>
        <span className="text-[11px] text-muted">
          Clic = ajouter/retirer au mariage
        </span>
      </div>
      {/* Scroll horizontal sur écran étroit pour garder l'alignement 12 colonnes */}
      <div className="overflow-x-auto -mx-1 pb-2">
        <div className="grid grid-cols-12 gap-1 min-w-[720px] px-1">
          {palette.map((shade) => {
            const id = `${hex}-${shade.name}`;
            return (
              <ShadeCard
                key={shade.name}
                shade={shade}
                isSelected={selected.has(id)}
                onToggle={() =>
                  onToggleShade({ id, hex: shade.hex, source: `shade ${shade.name} de ${hex}` })
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type FilterMode = "all" | "aa" | "aa-large" | "aaa";

function ContrastMatrix({
  palette,
  onLoadFiveColors,
}: {
  palette: PaletteShade[];
  onLoadFiveColors: (colors: string[]) => void;
}) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [collapsed, setCollapsed] = useState(true);
  const composition = useMemo(() => suggestFiveColors(palette), [palette]);

  function passes(ratio: number): boolean {
    if (filter === "all") return true;
    if (filter === "aa-large") return ratio >= 3;
    if (filter === "aa") return ratio >= 4.5;
    if (filter === "aaa") return ratio >= 7;
    return true;
  }

  function cellColor(ratio: number): string {
    if (ratio >= 7) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    if (ratio >= 4.5) return "bg-green-500/15 text-green-700 dark:text-green-400";
    if (ratio >= 3) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    return "bg-red-500/10 text-red-600/70 dark:text-red-400/70";
  }

  const stats = useMemo(() => {
    const total = palette.length * palette.length;
    let aaa = 0,
      aa = 0,
      aaL = 0;
    for (const fg of palette) {
      for (const bg of palette) {
        const r = contrastRatio(fg.hex, bg.hex);
        if (r >= 7) aaa++;
        if (r >= 4.5) aa++;
        if (r >= 3) aaL++;
      }
    }
    return { total, aaa, aa, aaL };
  }, [palette]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-muted hover:text-foreground transition text-sm"
            aria-label={collapsed ? "Déplier" : "Replier"}
          >
            {collapsed ? "▶" : "▼"}
          </button>
          Matrice de contraste{" "}
          <span className="text-muted font-normal text-sm">
            ({palette.length}×{palette.length} paires · text sur bg)
          </span>
        </h3>
        {!collapsed && (
          <div className="flex gap-1 text-[11px]">
            {(["all", "aa-large", "aa", "aaa"] as FilterMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`px-2 py-1 rounded border transition ${
                  filter === m
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                {m === "all"
                  ? "Tout"
                  : m === "aa-large"
                  ? "≥3 (AA-L)"
                  : m === "aa"
                  ? "≥4.5 (AA)"
                  : "≥7 (AAA)"}
              </button>
            ))}
          </div>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher la matrice 12×12 + les 5 couleurs recommandées
        </button>
      )}

      {!collapsed && (
      <>


      <div className="flex gap-3 text-[11px] text-muted flex-wrap items-center">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/50 mr-1" />
          AAA : {stats.aaa}/{stats.total}
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500/50 mr-1" />
          AA : {stats.aa}/{stats.total}
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500/50 mr-1" />
          AA-Large : {stats.aaL}/{stats.total}
        </span>
      </div>

      {composition && (
        <div className="bg-card/60 border border-accent/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-semibold">💡 5 couleurs recommandées</h4>
            <button
              onClick={() =>
                onLoadFiveColors([
                  composition.bgLight.hex,
                  composition.text.hex,
                  composition.accent.hex,
                  composition.bgDark.hex,
                  composition.accentSubtle.hex,
                ])
              }
              className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
            >
              👁️ Charger les 5 couleurs dans le mariage
            </button>
          </div>
          <p className="text-[11px] text-muted">
            Le spectre utile de ta palette : bg clair + texte + accent + bg sombre + accent doux.
            Chaque couleur a un rôle dans une UI complète.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "BG Light", shade: composition.bgLight, role: "bg" },
              { label: "Text", shade: composition.text, role: "fg" },
              { label: "Accent", shade: composition.accent, role: "cta" },
              { label: "BG Dark", shade: composition.bgDark, role: "bg" },
              { label: "Accent Subtle", shade: composition.accentSubtle, role: "border" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg overflow-hidden border border-border"
              >
                <div className="h-16" style={{ background: item.shade.hex }} />
                <div className="p-2 bg-card/50">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-mono text-muted">{item.shade.hex}</div>
                  <div className="text-[10px] font-mono text-muted">shade {item.shade.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-1 pb-2">
        <div
          className="grid gap-0.5 px-1"
          style={{
            gridTemplateColumns: `auto repeat(${palette.length}, minmax(44px, 1fr))`,
            minWidth: `${44 * (palette.length + 1) + 8 * palette.length}px`,
          }}
        >
          {/* Header row */}
          <div />
          {palette.map((bg) => (
            <div key={`h-${bg.name}`} className="text-center text-[10px] font-mono text-muted pb-1">
              bg {bg.name}
            </div>
          ))}

          {/* Rows : fg × bg */}
          {palette.map((fg) => (
            <RowCells key={fg.name} fg={fg} palette={palette} passes={passes} cellColor={cellColor} />
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

function RowCells({
  fg,
  palette,
  passes,
  cellColor,
}: {
  fg: PaletteShade;
  palette: PaletteShade[];
  passes: (r: number) => boolean;
  cellColor: (r: number) => string;
}) {
  return (
    <>
      <div className="text-[10px] font-mono text-muted flex items-center pr-2 whitespace-nowrap">
        text {fg.name}
      </div>
      {palette.map((bg) => {
        const ratio = contrastRatio(fg.hex, bg.hex);
        const show = passes(ratio);
        return (
          <div
            key={`${fg.name}-${bg.name}`}
            className={`text-center text-[10px] font-mono rounded aspect-square flex flex-col items-center justify-center transition ${
              show ? cellColor(ratio) : "opacity-15"
            }`}
            style={{
              background: show ? bg.hex : undefined,
              color: show ? fg.hex : undefined,
            }}
            title={`text ${fg.name} (${fg.hex}) sur bg ${bg.name} (${bg.hex}) → ratio ${ratio.toFixed(2)}`}
          >
            <span className="font-semibold">Aa</span>
            <span className="text-[9px]">{ratio.toFixed(1)}</span>
          </div>
        );
      })}
    </>
  );
}

function ratioVerdict(ratio: number): { label: string; color: string } {
  if (ratio >= 7) return { label: "AAA ✓", color: "text-emerald-600 font-semibold" };
  if (ratio >= 4.5) return { label: "AA ✓", color: "text-green-600" };
  if (ratio >= 3) return { label: "AA-Large ⚠", color: "text-amber-600" };
  return { label: "FAIL ✗", color: "text-red-500" };
}

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
              <span className="font-mono text-xs text-muted w-16 shrink-0">{ratio.toFixed(2)}</span>
              <span className={`text-xs ${verdict.color} w-24 shrink-0`}>{verdict.label}</span>
              <span className="text-xs text-muted hidden lg:inline">{p.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComboCard({
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
          title="Charge toutes les couleurs du combo dans le preview mariage"
        >
          Voir en preview
        </button>
      </div>
    </div>
  );
}

function MarriageChip({
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

  // Fermer le popover si clic à l'extérieur
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

      {/* Popover flottant : positionné au-dessus du chip, z-index élevé pour passer par-dessus le rapport WCAG */}
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
          {/* Flèche qui pointe vers le bas (vers le chip) */}
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

function MarriagePreview({
  selected,
  onRemove,
  onMove,
  onClear,
  onChangeColor,
}: {
  selected: SelectedShade[];
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
  onChangeColor: (id: string, newHex: string) => void;
}) {
  if (selected.length === 0) {
    return (
      <div className="bg-card/60 border border-dashed border-border rounded-2xl p-8 text-center text-sm text-muted">
        Clique sur des shades (palettes ci-dessus) ou directement sur une couleur de combo, ou
        utilise &quot;Voir en preview&quot; pour charger un combo entier.
      </div>
    );
  }

  const [bg, text, accent, secondary] = [
    selected[0]?.hex,
    selected[1]?.hex,
    selected[2]?.hex,
    selected[3]?.hex,
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold">
          Mariage — {selected.length} couleur(s){" "}
          <span className="text-muted font-normal text-sm">
            (réorganise avec ◀ ▶)
          </span>
        </h3>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
        >
          Tout retirer
        </button>
      </div>

      {/* Chips en HAUT : le popover d'édition s'ouvre AU-DESSUS dans l'espace libre */}
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

      {/* Contrôle WCAG juste en dessous des chips — toujours visible pendant l'édition */}
      <MarriageContrastReport selected={selected} />

      {/* Mockup live (au moins 2 couleurs) */}
      {selected.length >= 2 && bg && text && (
        <div
          className="rounded-2xl p-6 border border-border transition"
          style={{ background: bg, color: text }}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold mb-1" style={{ color: text }}>
                Exemple de mariage
              </h4>
              <p className="text-sm opacity-80" style={{ color: text }}>
                C&apos;est à ça que ressemblerait ton interface. Lis le texte, regarde le contraste,
                juge l&apos;ambiance.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: accent ?? text, color: bg }}
              >
                Action principale
              </button>
              {secondary && (
                <button
                  className="px-4 py-2 rounded-lg font-semibold text-sm border"
                  style={{ borderColor: secondary, color: text, background: "transparent" }}
                >
                  Action secondaire
                </button>
              )}
            </div>
            {accent && (
              <div
                className="rounded-lg p-4 text-sm"
                style={{
                  background: `color-mix(in oklch, ${accent} 15%, ${bg})`,
                  color: text,
                  border: `1px solid ${accent}`,
                }}
              >
                Une card avec fond dérivé de l&apos;accent et bordure d&apos;accent.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs font-mono text-muted">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
      <p className="text-[11px] text-muted">{hint}</p>
    </div>
  );
}

export default function DesignSpikePage() {
  const [customColor, setCustomColor] = useState("#7C6A4F");
  const [contrast, setContrast] = useState(1);
  const [chromaPeakIndex, setChromaPeakIndex] = useState(6);
  const [chromaAmount, setChromaAmount] = useState(1);
  const [styleFilter, setStyleFilter] = useState<ColorCombo["style"] | "all">("all");
  const [selected, setSelected] = useState<SelectedShade[]>([]);
  const [combosCollapsed, setCombosCollapsed] = useState(true);
  const [refPalettesCollapsed, setRefPalettesCollapsed] = useState(true);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [customCombos, setCustomCombos] = useState<ColorCombo[]>([]);
  const [newComboName, setNewComboName] = useState("");
  const [createComboOpen, setCreateComboOpen] = useState(false);
  const [directComboName, setDirectComboName] = useState("");
  const [directComboHex, setDirectComboHex] = useState("");
  const [directComboStyle, setDirectComboStyle] = useState<ColorCombo["style"]>("custom");
  const [directComboError, setDirectComboError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [colors, combos] = await Promise.all([fetchSavedColors(), fetchCustomCombos()]);
      if (cancelled) return;
      setSavedColors(colors.map((c) => c.toLowerCase()));
      setCustomCombos(combos.map(rowToCombo));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSavedColor(hex: string) {
    const normalized = hex.toLowerCase();
    const prev = savedColors;
    const next = prev.includes(normalized)
      ? prev.filter((c) => c !== normalized)
      : [...prev, normalized];
    setSavedColors(next);
    try {
      await updateSavedColors(next);
    } catch {
      setSavedColors(prev); // rollback
    }
  }

  async function saveCurrentAsCombo() {
    if (selected.length < 2 || !newComboName.trim()) return;
    const name = newComboName.trim();
    const colors = selected.map((s) => s.hex);
    const row = await createCustomCombo({ name, colors, style: "custom" });
    if (row) {
      setCustomCombos((prev) => [rowToCombo(row), ...prev]);
      setNewComboName("");
    }
  }

  async function handleDirectComboCreate() {
    const name = directComboName.trim();
    if (!name) {
      setDirectComboError("Donne un nom à ton combo.");
      return;
    }
    const colors = parseHexList(directComboHex);
    if (colors.length < 2) {
      setDirectComboError("Entre au moins 2 couleurs hex valides (#RRGGBB).");
      return;
    }
    setDirectComboError(null);
    const row = await createCustomCombo({
      name,
      colors,
      style: directComboStyle,
      note: "Créé depuis un import direct",
    });
    if (row) {
      setCustomCombos((prev) => [rowToCombo(row), ...prev]);
      setDirectComboName("");
      setDirectComboHex("");
      setDirectComboStyle("custom");
      setCreateComboOpen(false);
    }
  }

  async function deleteCustomCombo(id: string) {
    const prev = customCombos;
    setCustomCombos(prev.filter((c) => c.id !== id));
    try {
      await deleteCustomComboById(id);
    } catch {
      setCustomCombos(prev); // rollback
    }
  }

  const tuning: PaletteTuning = { contrast, chromaPeakIndex, chromaAmount };
  const selectedKeys = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const customPalette = useMemo(
    () => generatePalette(customColor, tuning),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customColor, contrast, chromaPeakIndex, chromaAmount]
  );

  function toggleShade(shade: SelectedShade) {
    setSelected((prev) =>
      prev.some((s) => s.id === shade.id)
        ? prev.filter((s) => s.id !== shade.id)
        : [...prev, shade]
    );
  }

  function removeShade(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  function moveShade(from: number, to: number) {
    setSelected((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }


  function loadFiveColorsIntoMarriage(colors: string[]) {
    const now = Date.now();
    setSelected(
      colors.map((hex, i) => ({
        id: `comp-${now}-${i}`,
        hex,
        source: "5 couleurs recommandées",
      }))
    );
    setTimeout(() => {
      document
        .getElementById("marriage-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function updateShadeColor(id: string, newHex: string) {
    setSelected((prev) => prev.map((s) => (s.id === id ? { ...s, hex: newHex, source: "édité manuellement" } : s)));
  }

  function pickFromCombo(hex: string, comboId: string, index: number, comboName: string) {
    const id = `${comboId}-${index}`;
    setSelected((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [...prev, { id, hex, source: comboName }]
    );
  }

  function loadComboAsMarriage(combo: ColorCombo) {
    setSelected(
      combo.colors.map((hex, i) => ({
        id: `${combo.id}-${i}`,
        hex,
        source: combo.name,
      }))
    );
    // Scroll vers le preview
    setTimeout(() => {
      document
        .getElementById("marriage-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function resetTuning() {
    setContrast(1);
    setChromaPeakIndex(6);
    setChromaAmount(1);
  }

  const allCombos = useMemo(() => [...customCombos, ...COLOR_COMBOS], [customCombos]);
  const filteredCombos =
    styleFilter === "all" ? allCombos : allCombos.filter((c) => c.style === styleFilter);
  const customComboIds = useMemo(() => new Set(customCombos.map((c) => c.id)), [customCombos]);

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          Spike OKLCH — palette + combos + mariage
        </h1>
        <p className="text-sm text-muted max-w-3xl">
          Validation de l&apos;algo OKLCH pour le chap. 6 Visuel. 3 blocs : éditeur de palette à
          partir d&apos;1 couleur + bibliothèque de combos inspirationnels + preview mariage en
          sélectionnant des shades ou en chargeant un combo entier.
        </p>
      </header>

      {/* ─────────── BLOC 1 : ÉDITEUR DE PALETTE ─────────── */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold">1. Éditeur de palette</h2>
          <button
            onClick={resetTuning}
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
          >
            Réinitialiser le tuning
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 w-16 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 px-3 font-mono text-sm rounded border border-border bg-card w-36"
          />
          <button
            onClick={() => toggleSavedColor(customColor)}
            className="h-10 px-3 rounded border border-border hover:bg-accent/10 transition text-sm"
            title={savedColors.includes(customColor) ? "Retirer des favoris" : "Sauver en favori"}
          >
            {savedColors.includes(customColor) ? "★ Favori" : "☆ Sauver"}
          </button>
        </div>

        {savedColors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted">Mes favoris :</span>
            {savedColors.map((c) => (
              <div key={c} className="flex items-center gap-1 bg-card/60 border border-border rounded-full px-1 py-1">
                <button
                  onClick={() => setCustomColor(c)}
                  className="w-6 h-6 rounded-full border border-border"
                  style={{ background: c }}
                  title={`Charger ${c}`}
                />
                <span className="font-mono text-[10px] text-muted">{c}</span>
                <button
                  onClick={() => toggleSavedColor(c)}
                  className="w-4 h-4 rounded-full text-muted hover:text-red-500 text-xs"
                  title="Retirer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Slider
            label="Intensité du contraste"
            hint="0.5 = plat, 1 = défaut, 1.4 = agressif"
            value={contrast}
            min={0.5}
            max={1.4}
            step={0.05}
            onChange={setContrast}
          />
          <Slider
            label="Pic de saturation"
            hint="Shade où la couleur est la plus vive"
            value={chromaPeakIndex}
            min={2}
            max={9}
            step={1}
            onChange={setChromaPeakIndex}
            format={(v) => `shade ${SHADE_NAMES[v]}`}
          />
          <Slider
            label="Saturation globale"
            hint="0 = gris, 1 = défaut, 1.5 = très vif"
            value={chromaAmount}
            min={0}
            max={1.5}
            step={0.05}
            onChange={setChromaAmount}
          />
        </div>

        <div className="border-t border-border pt-5 space-y-6">
          <PaletteRow
            name="Ta palette"
            hex={customColor}
            tuning={tuning}
            selected={selectedKeys}
            onToggleShade={toggleShade}
          />
          <ContrastMatrix palette={customPalette} onLoadFiveColors={loadFiveColorsIntoMarriage} />
        </div>
      </div>

      {/* ─────────── BLOC 2 : COMBOS INSPIRATIONNELS ─────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <button
              onClick={() => setCombosCollapsed((v) => !v)}
              className="text-muted hover:text-foreground transition text-sm"
              aria-label={combosCollapsed ? "Déplier" : "Replier"}
            >
              {combosCollapsed ? "▶" : "▼"}
            </button>
            2. Combos inspirationnels
            <span className="text-muted font-normal text-sm">
              ({COLOR_COMBOS.length + customCombos.length})
            </span>
          </h2>
          {!combosCollapsed && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted hidden md:inline">
                Clic couleur = ajouter au mariage · &quot;Voir en preview&quot; = charger le combo
              </span>
              <button
                onClick={() => setCreateComboOpen((v) => !v)}
                className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
              >
                {createComboOpen ? "Annuler" : "➕ Créer un combo"}
              </button>
            </div>
          )}
        </div>

        {combosCollapsed && !createComboOpen && (
          <button
            onClick={() => setCombosCollapsed(false)}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
          >
            ▼ Afficher les {COLOR_COMBOS.length + customCombos.length} combos
          </button>
        )}

        {!combosCollapsed && (
        <>


        {createComboOpen && (
          <div className="bg-card/80 border border-accent/30 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm">Créer un combo perso (import direct)</h3>
            <p className="text-xs text-muted">
              Colle les codes hex de ton combo (trouvés sur TikTok, Coolors, etc.). Format libre :
              séparés par virgules, espaces, ou retours à la ligne.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nom du combo *</label>
                <input
                  type="text"
                  value={directComboName}
                  onChange={(e) => setDirectComboName(e.target.value)}
                  placeholder="Ex : Mon combo TikTok"
                  className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Style</label>
                <select
                  value={directComboStyle}
                  onChange={(e) => setDirectComboStyle(e.target.value as ColorCombo["style"])}
                  className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                >
                  {COMBO_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                  <option value="custom">🎨 Custom</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Couleurs (au moins 2 hex) *</label>
              <textarea
                value={directComboHex}
                onChange={(e) => setDirectComboHex(e.target.value)}
                placeholder="#111827, #ff6b5b&#10;ou&#10;#0d2b35 #f3e9e2 #c9886b"
                rows={3}
                className="w-full px-3 py-2 text-sm font-mono rounded border border-border bg-card"
              />
              <div className="flex items-center gap-2 flex-wrap">
                {parseHexList(directComboHex).map((hex) => (
                  <div
                    key={hex}
                    className="flex items-center gap-1 text-[11px] font-mono border border-border rounded-full px-2 py-0.5"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ background: hex }}
                    />
                    {hex}
                  </div>
                ))}
              </div>
            </div>
            {directComboError && (
              <p className="text-xs text-red-500">{directComboError}</p>
            )}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setCreateComboOpen(false)}
                className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDirectComboCreate}
                className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition"
              >
                Sauver le combo
              </button>
            </div>
          </div>
        )}

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
          {COMBO_STYLES.map((s) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCombos.map((combo) => (
            <div key={combo.id} className="relative">
              {customComboIds.has(combo.id) && (
                <button
                  onClick={() => deleteCustomCombo(combo.id)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs hover:bg-red-500"
                  title="Supprimer ce combo perso"
                >
                  ×
                </button>
              )}
              {customComboIds.has(combo.id) && (
                <span className="absolute top-2 left-2 z-10 text-[10px] bg-accent text-white px-1.5 py-0.5 rounded">
                  Perso
                </span>
              )}
              <ComboCard
                combo={combo}
                onPickColor={pickFromCombo}
                onLoadAllToPreview={loadComboAsMarriage}
              />
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* ─────────── BLOC 3 : MARIAGE ─────────── */}
      <div id="marriage-section" className="space-y-4 scroll-mt-4">
        <h2 className="text-xl font-bold">3. Preview du mariage</h2>
        <MarriagePreview
          selected={selected}
          onRemove={removeShade}
          onMove={moveShade}
          onClear={() => setSelected([])}
          onChangeColor={updateShadeColor}
        />
        {selected.length >= 2 && (
          <div className="bg-card/60 border border-border rounded-xl p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Sauver ce mariage comme combo :</span>
            <input
              type="text"
              value={newComboName}
              onChange={(e) => setNewComboName(e.target.value)}
              placeholder="Ex : Mon style vintage"
              className="h-9 px-3 text-sm rounded border border-border bg-card flex-1 min-w-[200px]"
            />
            <button
              onClick={saveCurrentAsCombo}
              disabled={!newComboName.trim()}
              className="h-9 px-4 text-sm rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sauver
            </button>
          </div>
        )}
      </div>

      {/* ─────────── BLOC 4 : PALETTES DE RÉFÉRENCE ─────────── */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <button
            onClick={() => setRefPalettesCollapsed((v) => !v)}
            className="text-muted hover:text-foreground transition text-sm"
            aria-label={refPalettesCollapsed ? "Déplier" : "Replier"}
          >
            {refPalettesCollapsed ? "▶" : "▼"}
          </button>
          4. Palettes de référence
          <span className="text-muted font-normal text-sm">
            ({TEST_COLORS.length} · tuning par défaut)
          </span>
        </h2>

        {refPalettesCollapsed && (
          <button
            onClick={() => setRefPalettesCollapsed(false)}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
          >
            ▼ Afficher les {TEST_COLORS.length} palettes de référence
          </button>
        )}

        {!refPalettesCollapsed && (
          <div className="space-y-8">
            {TEST_COLORS.map(({ name, hex }) => (
              <PaletteRow
                key={hex}
                name={name}
                hex={hex}
                selected={selectedKeys}
                onToggleShade={toggleShade}
              />
            ))}
          </div>
        )}
      </div>

      <footer className="text-xs text-muted border-t border-border pt-6 space-y-2">
        <p>
          <strong>Palette vs combo</strong> : palette = 12 shades d&apos;une même couleur (outil
          technique). Combo = 2-5 couleurs qui se marient bien (outil inspirationnel).
        </p>
        <p>
          <strong>Rôles</strong> : 1ère couleur = Background, 2e = Text, 3e = Accent, 4e =
          Secondary. Utilise ◀ ▶ pour réorganiser.
        </p>
      </footer>
    </main>
  );
}
