// Règles de validation du design system : alertes pédagogiques quand l'user
// dévie des bonnes pratiques (Refactoring UI, WCAG, etc.).

import type { PaletteShade } from "./oklch";
import { contrastRatio } from "./oklch";
import {
  RADIUS_PRESETS,
  type SpacingPresetKey,
  type DensityKey,
  type RadiusKey,
  type ShadowKey,
} from "./tokens";

export interface ValidationIssue {
  id: string;
  level: "error" | "warning" | "info";
  category: "couleur" | "contraste" | "typo" | "spacing" | "radius" | "shadow" | "système";
  title: string;
  hint: string;
}

interface ValidationInput {
  primaryHex: string;
  palette: PaletteShade[];
  selectedColors: { role: string; hex: string }[];
  typoBaseSize: number;
  typoRatio: number;
  spacingPreset: SpacingPresetKey;
  spacingDensity: DensityKey;
  radius: RadiusKey;
  shadow: ShadowKey;
}

export function validateDesignSystem(input: ValidationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // ─── COULEUR ──────────────────────────────────────────────────────────
  // 1. Pas assez de shades dans la palette (ne devrait pas arriver mais sécu)
  if (input.palette.length < 12) {
    issues.push({
      id: "palette-incomplete",
      level: "error",
      category: "couleur",
      title: "Palette incomplète",
      hint: "La palette devrait avoir 12 shades.",
    });
  }

  // 2. Saturation excessive en moyenne (chroma > 0.18)
  const avgChroma =
    input.palette.reduce((sum, s) => sum + s.oklch.c, 0) / input.palette.length;
  if (avgChroma > 0.13) {
    issues.push({
      id: "palette-too-saturated",
      level: "warning",
      category: "couleur",
      title: "Palette très saturée",
      hint:
        "Saturation moyenne élevée. Utilise les shades hautes (50-200) en bg, pas en éléments primaires, sinon fatigue visuelle.",
    });
  }

  // ─── CONTRASTE (mariage) ──────────────────────────────────────────────
  if (input.selectedColors.length >= 2) {
    const bg = input.selectedColors[0]?.hex;
    const text = input.selectedColors[1]?.hex;
    const accent = input.selectedColors[2]?.hex;
    const secondary = input.selectedColors[3]?.hex;

    if (bg && text) {
      const r = contrastRatio(text, bg);
      if (r < 4.5) {
        issues.push({
          id: "contrast-text-bg",
          level: "error",
          category: "contraste",
          title: `Text/Background : ${r.toFixed(2)} (FAIL)`,
          hint:
            "Texte illisible pour 15% des users. WCAG AA exige ≥4.5. Clic sur le chip pour ajuster.",
        });
      }
    }
    if (bg && accent) {
      const r = contrastRatio(accent, bg);
      if (r < 3) {
        issues.push({
          id: "contrast-accent-bg",
          level: "warning",
          category: "contraste",
          title: `Accent/Background : ${r.toFixed(2)} (FAIL)`,
          hint: "Bouton CTA invisible. WCAG 1.4.11 exige ≥3:1 sur les UI components.",
        });
      }
    }
    if (text && accent) {
      const r = contrastRatio(text, accent);
      if (r < 4.5) {
        issues.push({
          id: "contrast-text-accent",
          level: "warning",
          category: "contraste",
          title: `Text/Accent : ${r.toFixed(2)} (FAIL)`,
          hint:
            "Si tu mets du texte sur le bouton accent, il sera illisible. Soit tu prends une autre couleur de texte sur l'accent (ex: bg), soit tu changes l'accent.",
        });
      }
    }
    if (bg && secondary) {
      const r = contrastRatio(secondary, bg);
      if (r < 3) {
        issues.push({
          id: "contrast-secondary-bg",
          level: "info",
          category: "contraste",
          title: `Secondary/Background : ${r.toFixed(2)} (faible)`,
          hint: "Bordure peu visible. OK pour décoration, problème pour interactivité.",
        });
      }
    }
  }

  // ─── TYPO ─────────────────────────────────────────────────────────────
  // 3. Base size trop petite
  if (input.typoBaseSize < 15) {
    issues.push({
      id: "typo-small",
      level: "warning",
      category: "typo",
      title: `Base size ${input.typoBaseSize}px (petit)`,
      hint:
        "Base < 15px = texte trop petit pour la lecture confortable. Standard moderne : 16-17px.",
    });
  }

  // 4. Ratio trop agressif
  if (input.typoRatio > 1.5) {
    issues.push({
      id: "typo-ratio-high",
      level: "info",
      category: "typo",
      title: `Ratio ${input.typoRatio} (très expressif)`,
      hint:
        "Ratio > 1.5 = très grands écarts entre tailles. OK pour landing pages, peut être trop pour app dense.",
    });
  }

  // 5. Ratio trop plat
  if (input.typoRatio < 1.15) {
    issues.push({
      id: "typo-ratio-low",
      level: "info",
      category: "typo",
      title: `Ratio ${input.typoRatio} (très serré)`,
      hint:
        "Ratio < 1.15 = peu de contraste entre tailles. Hiérarchie pas claire.",
    });
  }

  // ─── SPACING ──────────────────────────────────────────────────────────
  // 6. Density compact = power user only
  if (input.spacingDensity === "compact") {
    issues.push({
      id: "spacing-compact",
      level: "info",
      category: "spacing",
      title: "Densité compact",
      hint:
        "Bien pour power users (Linear/Notion). Risque d'exclure les seniors et users tactiles. Idéalement laisser le choix à l'user.",
    });
  }

  // ─── RADIUS ───────────────────────────────────────────────────────────
  const radiusPx = RADIUS_PRESETS[input.radius].value;
  // 7. Radius extrêmes
  if (input.radius === "full") {
    issues.push({
      id: "radius-full",
      level: "info",
      category: "radius",
      title: "Radius full (pilule)",
      hint:
        "OK pour boutons et avatars. Évite sur cards de contenu (peu lisible visuellement).",
    });
  }
  if (radiusPx > 16) {
    issues.push({
      id: "radius-very-rounded",
      level: "info",
      category: "radius",
      title: `Radius ${radiusPx}px (très arrondi)`,
      hint: "Style playful. Vérifie que c'est cohérent avec ton ton de marque.",
    });
  }

  // ─── SHADOW ───────────────────────────────────────────────────────────
  // 8. Shadow none + radius bas = brutalist
  if (input.shadow === "none" && radiusPx === 0) {
    issues.push({
      id: "brutalist-style",
      level: "info",
      category: "système",
      title: "Style brutalist détecté (radius 0 + shadow none)",
      hint:
        "Cohérent. Vérifie juste que c'est intentionnel (pas un oubli de personnalisation).",
    });
  }
  // 9. Shadow XXL = mauvaise pratique souvent
  if (input.shadow === "2xl") {
    issues.push({
      id: "shadow-too-heavy",
      level: "info",
      category: "shadow",
      title: "Shadow 2xl (très marquée)",
      hint:
        "Réserve aux modals et popovers premium. Sur des cards normales = trop chargé.",
    });
  }

  return issues;
}

export function severityIcon(level: ValidationIssue["level"]): string {
  if (level === "error") return "🚨";
  if (level === "warning") return "⚠️";
  return "💡";
}

export function severityColorClass(level: ValidationIssue["level"]): string {
  if (level === "error") return "border-red-500/40 bg-red-500/5";
  if (level === "warning") return "border-amber-500/40 bg-amber-500/5";
  return "border-blue-500/40 bg-blue-500/5";
}
