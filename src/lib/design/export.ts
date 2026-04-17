// Sérialisation du design system (palette + tokens) vers 6 formats :
// - CSS variables (custom properties)
// - Tailwind v4 (@theme directive)
// - W3C Design Tokens JSON (DTCG format)
// - Markdown guidelines (Claude / Notion ready)
// - shadcn/ui globals.css (feature 1 — écosystème shadcn/Tailwind v4)
// - DESIGN.md (feature 2 — standard agent-friendly style Google Stitch)

import type { PaletteShade } from "./oklch";
import { generateDarkFromLight } from "./oklch";
import {
  RADIUS_PRESETS,
  SHADOW_PRESETS,
  generateTypoScale,
  generateSpacingScale,
  type SpacingPresetKey,
  type DensityKey,
  type RadiusKey,
  type ShadowKey,
} from "./tokens";
import type { FontPairing } from "./fonts";

export interface ProjectContext {
  name: string;
  officialName?: string | null;
  type?: string | null;
  description?: string | null;
  northStar?: string | null;
}

export interface DesignSystemSnapshot {
  primaryHex: string;
  palette: PaletteShade[];
  selectedColors: { role: string; hex: string }[];
  typoBaseSize: number;
  typoRatio: number;
  spacingPreset: SpacingPresetKey;
  spacingDensity: DensityKey;
  radius: RadiusKey;
  shadow: ShadowKey;
  fontPairing?: FontPairing;
  project?: ProjectContext;
}

function fontStack(font: { family: string; fallback: string }): string {
  return `"${font.family}", ${font.fallback}`;
}

// ─── CSS variables ──────────────────────────────────────────────────────────

export function exportCss(snapshot: DesignSystemSnapshot): string {
  const lines: string[] = [];
  lines.push("/* Design system généré par Mindeck */");
  lines.push(":root {");

  lines.push("  /* Couleurs primary (12 shades OKLCH) */");
  for (const shade of snapshot.palette) {
    lines.push(`  --color-primary-${shade.name}: ${shade.css};`);
  }

  if (snapshot.selectedColors.length > 0) {
    lines.push("");
    lines.push("  /* Couleurs sémantiques (mariage) */");
    for (const { role, hex } of snapshot.selectedColors) {
      const semanticName = role.toLowerCase().replace(/\s+/g, "-");
      lines.push(`  --color-${semanticName}: ${hex};`);
    }
  }

  // Fonts
  if (snapshot.fontPairing) {
    lines.push("");
    lines.push(`  /* Fonts (${snapshot.fontPairing.name}) */`);
    lines.push(`  --font-heading: ${fontStack(snapshot.fontPairing.heading)};`);
    lines.push(`  --font-body: ${fontStack(snapshot.fontPairing.body)};`);
    if (snapshot.fontPairing.mono) {
      lines.push(`  --font-mono: ${fontStack(snapshot.fontPairing.mono)};`);
    }
  }

  // Typography
  const typo = generateTypoScale(snapshot.typoBaseSize, snapshot.typoRatio);
  lines.push("");
  lines.push("  /* Typographie */");
  for (const size of typo.sizes) {
    lines.push(`  --font-size-${size.name}: ${size.rem}rem; /* ${size.px}px */`);
    lines.push(`  --line-height-${size.name}: ${size.lineHeight};`);
  }

  // Spacing
  const spacing = generateSpacingScale(snapshot.spacingPreset, snapshot.spacingDensity);
  lines.push("");
  lines.push(`  /* Spacing (${snapshot.spacingPreset}, density ${snapshot.spacingDensity}) */`);
  spacing.values.forEach((v, i) => {
    lines.push(`  --space-${i}: ${v}px;`);
  });

  // Radius
  const radiusPx = RADIUS_PRESETS[snapshot.radius].value;
  lines.push("");
  lines.push("  /* Radius */");
  lines.push(`  --radius: ${radiusPx === 9999 ? "9999px" : `${radiusPx}px`}; /* ${snapshot.radius} */`);

  // Shadow
  lines.push("");
  lines.push("  /* Shadow */");
  lines.push(`  --shadow: ${SHADOW_PRESETS[snapshot.shadow].value}; /* ${snapshot.shadow} */`);

  lines.push("}");
  return lines.join("\n");
}

// ─── Tailwind v4 @theme ─────────────────────────────────────────────────────

export function exportTailwind(snapshot: DesignSystemSnapshot): string {
  const lines: string[] = [];
  lines.push('/* Tailwind CSS v4 — à coller dans ton globals.css */');
  lines.push('@import "tailwindcss";');
  lines.push("");
  lines.push("@theme {");

  lines.push("  /* Couleurs */");
  for (const shade of snapshot.palette) {
    lines.push(`  --color-primary-${shade.name}: ${shade.css};`);
  }

  if (snapshot.selectedColors.length > 0) {
    lines.push("");
    lines.push("  /* Couleurs sémantiques */");
    for (const { role, hex } of snapshot.selectedColors) {
      const semanticName = role.toLowerCase().replace(/\s+/g, "-");
      lines.push(`  --color-${semanticName}: ${hex};`);
    }
  }

  // Fonts
  if (snapshot.fontPairing) {
    lines.push("");
    lines.push(`  /* Fonts (${snapshot.fontPairing.name}) */`);
    lines.push(`  --font-heading: ${fontStack(snapshot.fontPairing.heading)};`);
    lines.push(`  --font-body: ${fontStack(snapshot.fontPairing.body)};`);
    if (snapshot.fontPairing.mono) {
      lines.push(`  --font-mono: ${fontStack(snapshot.fontPairing.mono)};`);
    }
  }

  // Typography
  const typo = generateTypoScale(snapshot.typoBaseSize, snapshot.typoRatio);
  lines.push("");
  lines.push("  /* Typographie */");
  for (const size of typo.sizes) {
    lines.push(`  --text-${size.name}: ${size.rem}rem;`);
    lines.push(`  --text-${size.name}--line-height: ${size.lineHeight};`);
  }

  // Spacing
  const spacing = generateSpacingScale(snapshot.spacingPreset, snapshot.spacingDensity);
  lines.push("");
  lines.push("  /* Spacing */");
  spacing.values.forEach((v, i) => {
    lines.push(`  --spacing-${i}: ${v}px;`);
  });

  // Radius
  lines.push("");
  lines.push("  /* Radius */");
  for (const [key, val] of Object.entries(RADIUS_PRESETS)) {
    lines.push(`  --radius-${key}: ${val.value === 9999 ? "9999px" : `${val.value}px`};`);
  }

  // Shadow
  lines.push("");
  lines.push("  /* Shadow */");
  for (const [key, val] of Object.entries(SHADOW_PRESETS)) {
    lines.push(`  --shadow-${key}: ${val.value};`);
  }

  lines.push("}");
  return lines.join("\n");
}

// ─── W3C Design Tokens JSON (DTCG) ──────────────────────────────────────────

export function exportDtcgJson(snapshot: DesignSystemSnapshot): string {
  const typo = generateTypoScale(snapshot.typoBaseSize, snapshot.typoRatio);
  const spacing = generateSpacingScale(snapshot.spacingPreset, snapshot.spacingDensity);

  const tokens: Record<string, unknown> = {
    $description: "Design system généré par Mindeck",
    color: {
      primary: Object.fromEntries(
        snapshot.palette.map((s) => [
          String(s.name),
          {
            $type: "color",
            $value: s.css,
            $description: `Shade ${s.name} de la palette primary`,
          },
        ])
      ),
      ...(snapshot.selectedColors.length > 0
        ? {
            semantic: Object.fromEntries(
              snapshot.selectedColors.map(({ role, hex }) => [
                role.toLowerCase().replace(/\s+/g, "-"),
                { $type: "color", $value: hex, $description: `Rôle : ${role}` },
              ])
            ),
          }
        : {}),
    },
    fontSize: Object.fromEntries(
      typo.sizes.map((s) => [
        s.name,
        {
          $type: "dimension",
          $value: { value: s.rem, unit: "rem" },
          $description: `${s.px}px (line-height ${s.lineHeight})`,
        },
      ])
    ),
    space: Object.fromEntries(
      spacing.values.map((v, i) => [
        String(i),
        {
          $type: "dimension",
          $value: { value: v, unit: "px" },
        },
      ])
    ),
    radius: {
      default: {
        $type: "dimension",
        $value: {
          value: RADIUS_PRESETS[snapshot.radius].value,
          unit: "px",
        },
        $description: `Preset ${snapshot.radius}`,
      },
    },
    shadow: {
      default: {
        $type: "shadow",
        $value: SHADOW_PRESETS[snapshot.shadow].value,
        $description: `Preset ${snapshot.shadow}`,
      },
    },
  };

  return JSON.stringify(tokens, null, 2);
}

// ─── Markdown guidelines (Claude / Notion ready) ────────────────────────────

export function exportMarkdown(snapshot: DesignSystemSnapshot): string {
  const typo = generateTypoScale(snapshot.typoBaseSize, snapshot.typoRatio);
  const spacing = generateSpacingScale(snapshot.spacingPreset, snapshot.spacingDensity);
  const radiusPx = RADIUS_PRESETS[snapshot.radius].value;

  const lines: string[] = [];
  lines.push("# Design system");
  lines.push("");
  lines.push("> Généré par Mindeck");
  lines.push("");

  if (snapshot.project) {
    const { name, officialName, type, description, northStar } = snapshot.project;
    lines.push(`## Contexte projet`);
    lines.push("");
    lines.push(`- **Projet** : ${officialName || name}`);
    if (type) lines.push(`- **Type** : ${type}`);
    if (description) lines.push(`- **Description** : ${description}`);
    if (northStar) lines.push(`- **North Star** : ${northStar}`);
    lines.push("");
  }

  lines.push("## Palette de couleurs");
  lines.push("");
  lines.push(`Source primary : \`${snapshot.primaryHex}\` — 12 shades OKLCH perceptuelles.`);
  lines.push("");
  lines.push("| Shade | Hex | OKLCH |");
  lines.push("|---|---|---|");
  for (const s of snapshot.palette) {
    lines.push(`| primary-${s.name} | \`${s.hex}\` | \`${s.css}\` |`);
  }

  if (snapshot.selectedColors.length > 0) {
    lines.push("");
    lines.push("### Couleurs sémantiques (mariage)");
    lines.push("");
    for (const { role, hex } of snapshot.selectedColors) {
      lines.push(`- **${role}** : \`${hex}\``);
    }
  }

  lines.push("");
  lines.push("## Fonts");
  lines.push("");
  if (snapshot.fontPairing) {
    lines.push(`- Pairing : **${snapshot.fontPairing.name}** (${snapshot.fontPairing.style})`);
    lines.push(`- Heading : \`${snapshot.fontPairing.heading.family}\``);
    lines.push(`- Body : \`${snapshot.fontPairing.body.family}\``);
    if (snapshot.fontPairing.mono) {
      lines.push(`- Mono : \`${snapshot.fontPairing.mono.family}\``);
    }
  } else {
    lines.push("- Aucun pairing sélectionné (fonts système).");
  }

  lines.push("");
  lines.push("## Typographie");
  lines.push("");
  lines.push(`- Base size : **${snapshot.typoBaseSize}px**`);
  lines.push(`- Ratio modulaire : **${snapshot.typoRatio}**`);
  lines.push("");
  lines.push("| Token | Taille | rem | Line-height |");
  lines.push("|---|---|---|---|");
  for (const s of typo.sizes) {
    lines.push(`| ${s.name} | ${s.px}px | ${s.rem}rem | ${s.lineHeight} |`);
  }

  lines.push("");
  lines.push("## Espacement");
  lines.push("");
  lines.push(`- Preset : **${snapshot.spacingPreset}**`);
  lines.push(`- Densité : **${snapshot.spacingDensity}**`);
  lines.push("");
  lines.push(`Échelle : ${spacing.values.map((v) => `\`${v}px\``).join(" · ")}`);

  lines.push("");
  lines.push("## Radius");
  lines.push("");
  lines.push(`- Preset : **${snapshot.radius}**`);
  lines.push(`- Valeur : ${radiusPx === 9999 ? "9999px (pilule)" : `${radiusPx}px`}`);

  lines.push("");
  lines.push("## Shadow");
  lines.push("");
  lines.push(`- Preset : **${snapshot.shadow}**`);
  lines.push(`- CSS : \`${SHADOW_PRESETS[snapshot.shadow].value}\``);

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("*Tu peux coller ce document dans Claude / ChatGPT pour qu'il génère du code aligné sur ce design system.*");

  return lines.join("\n");
}

// ─── shadcn/ui globals.css (feature 1) ──────────────────────────────────────
// Format attendu par shadcn/ui avec Tailwind v4 (OKLCH).
// Mapping automatique : palette primary → --primary, shades clairs/sombres → background/foreground/border, mariage → destructive/accent/secondary.

function resolvePaletteRole(palette: PaletteShade[], shadeName: number): string {
  const found = palette.find((s) => s.name === shadeName);
  return found ? found.css : palette[0].css;
}

export function exportShadcn(snapshot: DesignSystemSnapshot): string {
  const { palette, selectedColors } = snapshot;
  const darkPalette = generateDarkFromLight(palette);

  // Mapping lumineux : shade 50 = bg, 975 = fg, 500 = primary, 200 = border
  const get = (shade: number) => resolvePaletteRole(palette, shade);
  const getDark = (shade: number) => resolvePaletteRole(darkPalette, shade);

  // Palette rôles depuis le mariage si dispo
  const semanticMap = new Map(
    selectedColors.map((s) => [s.role.toLowerCase(), s.hex] as const)
  );
  const destructive =
    semanticMap.get("destructive") ?? semanticMap.get("error") ?? "#ef4444";
  const success = semanticMap.get("success") ?? "#10b981";
  const warning = semanticMap.get("warning") ?? "#f59e0b";

  const radiusPx = RADIUS_PRESETS[snapshot.radius].value;
  const radiusCss = radiusPx === 9999 ? "9999px" : `${radiusPx}px`;

  const lines: string[] = [];
  lines.push("/* shadcn/ui globals.css — généré par Mindeck */");
  lines.push('@import "tailwindcss";');
  lines.push("");
  lines.push('@custom-variant dark (&:is(.dark *));');
  lines.push("");
  lines.push("@layer base {");
  lines.push("  :root {");
  lines.push(`    --background: ${get(50)};`);
  lines.push(`    --foreground: ${get(975)};`);
  lines.push(`    --card: ${get(100)};`);
  lines.push(`    --card-foreground: ${get(975)};`);
  lines.push(`    --popover: ${get(50)};`);
  lines.push(`    --popover-foreground: ${get(975)};`);
  lines.push(`    --primary: ${get(500)};`);
  lines.push(`    --primary-foreground: ${get(50)};`);
  lines.push(`    --secondary: ${get(100)};`);
  lines.push(`    --secondary-foreground: ${get(900)};`);
  lines.push(`    --muted: ${get(100)};`);
  lines.push(`    --muted-foreground: ${get(600)};`);
  lines.push(`    --accent: ${get(500)};`);
  lines.push(`    --accent-foreground: ${get(50)};`);
  lines.push(`    --destructive: ${destructive};`);
  lines.push(`    --destructive-foreground: ${get(50)};`);
  lines.push(`    --success: ${success};`);
  lines.push(`    --warning: ${warning};`);
  lines.push(`    --border: ${get(200)};`);
  lines.push(`    --input: ${get(200)};`);
  lines.push(`    --ring: ${get(500)};`);
  lines.push(`    --radius: ${radiusCss};`);
  lines.push("  }");
  lines.push("");
  lines.push("  .dark {");
  lines.push(`    --background: ${getDark(50)};`);
  lines.push(`    --foreground: ${getDark(975)};`);
  lines.push(`    --card: ${getDark(100)};`);
  lines.push(`    --card-foreground: ${getDark(975)};`);
  lines.push(`    --popover: ${getDark(50)};`);
  lines.push(`    --popover-foreground: ${getDark(975)};`);
  lines.push(`    --primary: ${getDark(400)};`);
  lines.push(`    --primary-foreground: ${getDark(50)};`);
  lines.push(`    --secondary: ${getDark(100)};`);
  lines.push(`    --secondary-foreground: ${getDark(900)};`);
  lines.push(`    --muted: ${getDark(100)};`);
  lines.push(`    --muted-foreground: ${getDark(600)};`);
  lines.push(`    --accent: ${getDark(400)};`);
  lines.push(`    --accent-foreground: ${getDark(50)};`);
  lines.push(`    --destructive: ${destructive};`);
  lines.push(`    --destructive-foreground: ${getDark(50)};`);
  lines.push(`    --border: ${getDark(200)};`);
  lines.push(`    --input: ${getDark(200)};`);
  lines.push(`    --ring: ${getDark(400)};`);
  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push("@theme inline {");
  lines.push("  --color-background: var(--background);");
  lines.push("  --color-foreground: var(--foreground);");
  lines.push("  --color-card: var(--card);");
  lines.push("  --color-card-foreground: var(--card-foreground);");
  lines.push("  --color-primary: var(--primary);");
  lines.push("  --color-primary-foreground: var(--primary-foreground);");
  lines.push("  --color-secondary: var(--secondary);");
  lines.push("  --color-secondary-foreground: var(--secondary-foreground);");
  lines.push("  --color-muted: var(--muted);");
  lines.push("  --color-muted-foreground: var(--muted-foreground);");
  lines.push("  --color-accent: var(--accent);");
  lines.push("  --color-accent-foreground: var(--accent-foreground);");
  lines.push("  --color-destructive: var(--destructive);");
  lines.push("  --color-border: var(--border);");
  lines.push("  --color-input: var(--input);");
  lines.push("  --color-ring: var(--ring);");
  lines.push("  --radius-sm: calc(var(--radius) - 4px);");
  lines.push("  --radius-md: calc(var(--radius) - 2px);");
  lines.push("  --radius-lg: var(--radius);");
  lines.push("  --radius-xl: calc(var(--radius) + 4px);");
  lines.push("}");

  return lines.join("\n");
}

// ─── DESIGN.md agent-friendly (feature 2) ───────────────────────────────────
// Format structuré inspiré Google Stitch : un agent (Claude, ChatGPT, Cursor) peut
// le lire et produire du code parfaitement aligné sur le DS.

export function exportDesignMd(snapshot: DesignSystemSnapshot): string {
  const typo = generateTypoScale(snapshot.typoBaseSize, snapshot.typoRatio);
  const spacing = generateSpacingScale(snapshot.spacingPreset, snapshot.spacingDensity);
  const radiusPx = RADIUS_PRESETS[snapshot.radius].value;

  const lines: string[] = [];
  lines.push("# DESIGN.md");
  lines.push("");
  lines.push("> Source de vérité du design system — format agent-friendly");
  lines.push("> Généré par Mindeck");
  lines.push("");

  if (snapshot.project) {
    const { name, officialName, type, description, northStar } = snapshot.project;
    lines.push("## Project");
    lines.push("");
    lines.push(`- name: ${officialName || name}`);
    if (type) lines.push(`- type: ${type}`);
    if (description) lines.push(`- description: ${description}`);
    if (northStar) lines.push(`- north_star: ${northStar}`);
    lines.push("");
  }

  lines.push("## Brand");
  lines.push("");
  lines.push(`- primary: \`${snapshot.primaryHex}\``);
  lines.push("- palette:");
  for (const s of snapshot.palette) {
    lines.push(`  - primary.${s.name}: \`${s.hex}\` (${s.css})`);
  }
  if (snapshot.selectedColors.length > 0) {
    lines.push("- semantic:");
    for (const { role, hex } of snapshot.selectedColors) {
      lines.push(`  - ${role.toLowerCase()}: \`${hex}\``);
    }
  }
  lines.push("");

  lines.push("## Typography");
  lines.push("");
  if (snapshot.fontPairing) {
    lines.push(`- pairing: ${snapshot.fontPairing.name} (${snapshot.fontPairing.style})`);
    lines.push(`- heading: \`${snapshot.fontPairing.heading.family}\``);
    lines.push(`- body: \`${snapshot.fontPairing.body.family}\``);
    if (snapshot.fontPairing.mono) {
      lines.push(`- mono: \`${snapshot.fontPairing.mono.family}\``);
    }
  } else {
    lines.push("- fonts: system defaults");
  }
  lines.push(`- base_size: ${snapshot.typoBaseSize}px`);
  lines.push(`- ratio: ${snapshot.typoRatio}`);
  lines.push("- scale:");
  for (const s of typo.sizes) {
    lines.push(`  - ${s.name}: ${s.px}px / line-height ${s.lineHeight}`);
  }
  lines.push("");

  lines.push("## Spacing");
  lines.push("");
  lines.push(`- preset: ${snapshot.spacingPreset}`);
  lines.push(`- density: ${snapshot.spacingDensity}`);
  lines.push(`- scale: ${spacing.values.map((v) => `${v}px`).join(", ")}`);
  lines.push("");

  lines.push("## Shape");
  lines.push("");
  lines.push(
    `- radius: ${radiusPx === 9999 ? "9999px (pill)" : `${radiusPx}px`} (${snapshot.radius})`
  );
  lines.push(`- shadow: ${SHADOW_PRESETS[snapshot.shadow].value} (${snapshot.shadow})`);
  lines.push("");

  lines.push("## Components");
  lines.push("");
  lines.push("Les composants héritent des tokens ci-dessus. Règles de cohérence :");
  lines.push("- Boutons : utiliser `--primary` pour CTA, `--secondary` pour actions secondaires");
  lines.push("- Cards : fond `--card`, bordure `--border`, radius `--radius`");
  lines.push("- Inputs : bordure `--input`, focus `--ring`, radius `--radius`");
  lines.push("- Toasts : fond `--popover`, texte `--popover-foreground`, accents sémantiques");
  lines.push("");

  lines.push("## Accessibility");
  lines.push("");
  lines.push("- Contraste : WCAG 2.2 AA minimum (ratio ≥ 4.5 pour texte, ≥ 3 pour composants)");
  lines.push("- Focus : ring `--ring` visible sur tous les éléments interactifs");
  lines.push("- Dark mode : palette perceptuelle OKLCH générée automatiquement (chroma -15%)");
  lines.push("- Densité : `--spacing-*` ajustable selon `spacing_density` ci-dessus");
  lines.push("");

  lines.push("## Usage agent");
  lines.push("");
  lines.push("Pour générer du code aligné :");
  lines.push("1. Utiliser les tokens CSS (`var(--primary)`, `var(--background)`, etc.)");
  lines.push("2. Respecter la hiérarchie typographique (xl / lg / base / sm / xs)");
  lines.push("3. Ne pas introduire de couleurs hors palette sans raison sémantique");
  lines.push("4. Vérifier les contrastes WCAG pour toute nouvelle combinaison");

  return lines.join("\n");
}
