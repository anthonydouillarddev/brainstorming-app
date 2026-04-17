// Sérialisation du design system (palette + tokens) vers 4 formats :
// - CSS variables (custom properties)
// - Tailwind v4 (@theme directive)
// - W3C Design Tokens JSON (DTCG format)
// - Markdown guidelines (Claude / Notion ready)

import type { PaletteShade } from "./oklch";
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
