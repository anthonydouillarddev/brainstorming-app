// Types + helpers partagés entre les composants du chapitre Visuel.

import type { VisualSelectedShade } from "../state";

export type SelectedShade = VisualSelectedShade;

export type FilterMode = "all" | "aa" | "aa-large" | "aaa";

export const ROLES: { label: string; hint: string }[] = [
  { label: "Background", hint: "Le fond principal de ton interface" },
  { label: "Text", hint: "Le texte principal lu sur le background" },
  { label: "Accent", hint: "La couleur d'action (boutons, liens)" },
  { label: "Secondary", hint: "Une couleur secondaire (bordures, zones douces)" },
];

export function roleFor(index: number): { label: string; hint: string } {
  return ROLES[index] ?? { label: `Couleur ${index + 1}`, hint: "Couleur additionnelle" };
}

export function badgeClass(ratio: number): string {
  if (ratio >= 7) return "text-emerald-600 font-semibold";
  if (ratio >= 4.5) return "text-green-600";
  if (ratio >= 3) return "text-amber-600";
  return "text-muted";
}

export function ratioVerdict(ratio: number): { label: string; color: string } {
  if (ratio >= 7) return { label: "AAA ✓", color: "text-emerald-600 font-semibold" };
  if (ratio >= 4.5) return { label: "AA ✓", color: "text-green-600" };
  if (ratio >= 3) return { label: "AA-Large ⚠", color: "text-amber-600" };
  return { label: "FAIL ✗", color: "text-red-500" };
}

// Parse une saisie libre de hex ("#111, #222" ou "#111\n#222" ou "111 222")
const HEX_RE = /#?[0-9a-f]{6}/gi;
export function parseHexList(input: string): string[] {
  const matches = input.match(HEX_RE) ?? [];
  return Array.from(
    new Set(matches.map((m) => (m.startsWith("#") ? m : `#${m}`).toLowerCase()))
  );
}

export const TEST_COLORS = [
  { name: "Moka Mindeck", hex: "#7C6A4F" },
  { name: "Caramel Mindeck dark", hex: "#C9956B" },
  { name: "Bleu tech (Linear)", hex: "#3B82F6" },
  { name: "Vert success", hex: "#10b981" },
  { name: "Rouge error", hex: "#ef4444" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Jaune (test gamut)", hex: "#eab308" },
];
