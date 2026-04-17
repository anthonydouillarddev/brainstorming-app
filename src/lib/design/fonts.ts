// Bibliothèque de pairings de fonts curatés (open-source uniquement, v1).
// Chargement lazy via Google Fonts (link tag inséré à la volée).

export interface FontDef {
  family: string;
  weights: number[];
  fallback: string; // chaîne CSS fallback
  googleFontsUrl?: string; // si Google Fonts
}

export interface FontPairing {
  id: string;
  name: string;
  style: "minimal" | "expressif" | "editorial" | "techno" | "humanist" | "classique";
  hint: string;
  heading: FontDef;
  body: FontDef;
  mono?: FontDef;
}

// Helper pour générer l'URL Google Fonts
function gf(family: string, weights: number[]): string {
  const familyParam = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weights.join(";")}&display=swap`;
}

const SYSTEM_SANS_FALLBACK = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const SYSTEM_SERIF_FALLBACK = `Georgia, "Times New Roman", serif`;
const SYSTEM_MONO_FALLBACK = `ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace`;

export const FONT_PAIRINGS: FontPairing[] = [
  // ─── System (zéro chargement) ─────────────────────────────────────────
  {
    id: "system",
    name: "Système (zéro charge)",
    style: "minimal",
    hint: "Ultra rapide, font de l'OS de l'user. Mindeck par défaut.",
    heading: { family: "system-ui", weights: [600, 700], fallback: SYSTEM_SANS_FALLBACK },
    body: { family: "system-ui", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK },
    mono: { family: "ui-monospace", weights: [400], fallback: SYSTEM_MONO_FALLBACK },
  },

  // ─── Mono-typeface modernes (1 font partout) ───────────────────────────
  {
    id: "inter-mono",
    name: "Inter (mono-typeface)",
    style: "minimal",
    hint: "Standard SaaS moderne. Une seule font partout.",
    heading: { family: "Inter", weights: [600, 700], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500, 600, 700]) },
    body: { family: "Inter", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500]) },
    mono: { family: "JetBrains Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("JetBrains Mono", [400]) },
  },
  {
    id: "geist-mono",
    name: "Geist (Vercel)",
    style: "techno",
    hint: "La font de Vercel. Pure, neutre, tech.",
    heading: { family: "Geist", weights: [500, 700], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Geist", [400, 500, 700]) },
    body: { family: "Geist", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Geist", [400, 500]) },
    mono: { family: "Geist Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("Geist Mono", [400]) },
  },
  {
    id: "ibm-plex-mono",
    name: "IBM Plex Sans + Mono",
    style: "techno",
    hint: "IBM Carbon. Sérieux, lisible, tech.",
    heading: { family: "IBM Plex Sans", weights: [500, 700], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("IBM Plex Sans", [400, 500, 700]) },
    body: { family: "IBM Plex Sans", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("IBM Plex Sans", [400, 500]) },
    mono: { family: "IBM Plex Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("IBM Plex Mono", [400]) },
  },

  // ─── Serif display + Sans body (éditorial) ─────────────────────────────
  {
    id: "playfair-inter",
    name: "Playfair Display + Inter",
    style: "editorial",
    hint: "Élégant, magazine. Idéal landing pages classes.",
    heading: { family: "Playfair Display", weights: [700, 800], fallback: SYSTEM_SERIF_FALLBACK, googleFontsUrl: gf("Playfair Display", [700, 800]) },
    body: { family: "Inter", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500]) },
  },
  {
    id: "fraunces-inter",
    name: "Fraunces + Inter",
    style: "expressif",
    hint: "Variable serif, expressif et moderne.",
    heading: { family: "Fraunces", weights: [600, 800], fallback: SYSTEM_SERIF_FALLBACK, googleFontsUrl: gf("Fraunces", [400, 600, 800]) },
    body: { family: "Inter", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500]) },
  },
  {
    id: "lora-inter",
    name: "Lora + Inter",
    style: "editorial",
    hint: "Lecture longue (blog, doc). Lora a un beau côté manuscrit.",
    heading: { family: "Lora", weights: [600, 700], fallback: SYSTEM_SERIF_FALLBACK, googleFontsUrl: gf("Lora", [400, 600, 700]) },
    body: { family: "Inter", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500]) },
  },

  // ─── Humanist (chaleureux) ─────────────────────────────────────────────
  {
    id: "manrope-mono",
    name: "Manrope (chaleureux)",
    style: "humanist",
    hint: "Rondes, accueillantes. Bien pour produits B2C.",
    heading: { family: "Manrope", weights: [600, 800], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Manrope", [400, 500, 600, 800]) },
    body: { family: "Manrope", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Manrope", [400, 500]) },
    mono: { family: "JetBrains Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("JetBrains Mono", [400]) },
  },
  {
    id: "dm-sans-mono",
    name: "DM Sans + DM Mono",
    style: "humanist",
    hint: "Geometric humanist. Très bonne lisibilité.",
    heading: { family: "DM Sans", weights: [500, 700], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("DM Sans", [400, 500, 700]) },
    body: { family: "DM Sans", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("DM Sans", [400, 500]) },
    mono: { family: "DM Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("DM Mono", [400]) },
  },

  // ─── Expressif / Display ───────────────────────────────────────────────
  {
    id: "outfit-inter",
    name: "Outfit + Inter",
    style: "expressif",
    hint: "Outfit en headings affirmés + Inter pour le body.",
    heading: { family: "Outfit", weights: [600, 800], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Outfit", [400, 600, 800]) },
    body: { family: "Inter", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Inter", [400, 500]) },
  },
  {
    id: "space-grotesk-mono",
    name: "Space Grotesk + Mono",
    style: "techno",
    hint: "Vibe space-tech. Très différenciant.",
    heading: { family: "Space Grotesk", weights: [500, 700], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Space Grotesk", [400, 500, 700]) },
    body: { family: "Space Grotesk", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK, googleFontsUrl: gf("Space Grotesk", [400, 500]) },
    mono: { family: "Space Mono", weights: [400], fallback: SYSTEM_MONO_FALLBACK, googleFontsUrl: gf("Space Mono", [400]) },
  },

  // ─── Classique safe ────────────────────────────────────────────────────
  {
    id: "georgia-helvetica",
    name: "Georgia + System Sans",
    style: "classique",
    hint: "100% system fonts, zéro chargement. Bullet-proof.",
    heading: { family: "Georgia", weights: [700], fallback: SYSTEM_SERIF_FALLBACK },
    body: { family: "system-ui", weights: [400, 500], fallback: SYSTEM_SANS_FALLBACK },
  },
];

export const FONT_STYLES: { value: FontPairing["style"]; label: string; emoji: string }[] = [
  { value: "minimal", label: "Minimal", emoji: "▫️" },
  { value: "techno", label: "Techno", emoji: "⚡" },
  { value: "humanist", label: "Humanist", emoji: "🤝" },
  { value: "editorial", label: "Editorial", emoji: "📰" },
  { value: "expressif", label: "Expressif", emoji: "✨" },
  { value: "classique", label: "Classique", emoji: "🏛️" },
];

// ─── BIBLIOTHÈQUE GOOGLE FONTS ──────────────────────────────────────────────
// ~40 fonts classées par catégorie pour le mode "Custom" du FontsPicker.

export type FontCategory = "sans" | "serif" | "display" | "mono" | "handwriting";

export interface LibraryFont {
  family: string;
  category: FontCategory;
  weights: number[];
  hint?: string;
  isSystem?: boolean; // si true, pas besoin de Google Fonts
}

export const FONTS_LIBRARY: LibraryFont[] = [
  // System (zéro chargement)
  { family: "system-ui", category: "sans", weights: [400, 500, 600, 700], hint: "Font système de l'OS", isSystem: true },
  { family: "ui-monospace", category: "mono", weights: [400], hint: "Mono système", isSystem: true },
  { family: "Georgia", category: "serif", weights: [400, 700], hint: "Serif système", isSystem: true },

  // Sans-serif populaires
  { family: "Inter", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Standard SaaS moderne" },
  { family: "Geist", category: "sans", weights: [300, 400, 500, 600, 700, 900], hint: "Vercel" },
  { family: "IBM Plex Sans", category: "sans", weights: [300, 400, 500, 600, 700], hint: "IBM Carbon" },
  { family: "Roboto", category: "sans", weights: [300, 400, 500, 700, 900], hint: "Google/Material" },
  { family: "Open Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Ultra populaire" },
  { family: "Manrope", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Rondes, accueillant" },
  { family: "DM Sans", category: "sans", weights: [400, 500, 700], hint: "Geometric humanist" },
  { family: "Outfit", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], hint: "Variable, affirmé" },
  { family: "Space Grotesk", category: "sans", weights: [300, 400, 500, 600, 700], hint: "Space-tech" },
  { family: "Poppins", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Friendly geometric" },
  { family: "Work Sans", category: "sans", weights: [300, 400, 500, 600, 700], hint: "Modern sans" },
  { family: "Nunito", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], hint: "Très rondes, doux" },
  { family: "Figtree", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], hint: "Variable contemporain" },
  { family: "Plus Jakarta Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Indonésie, warm" },
  { family: "Public Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], hint: "USWDS, neutre" },
  { family: "Onest", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], hint: "Très moderne" },
  { family: "Sora", category: "sans", weights: [300, 400, 500, 600, 700, 800], hint: "Clair et ouvert" },

  // Display / Expressif
  { family: "Bricolage Grotesque", category: "display", weights: [400, 500, 600, 700, 800], hint: "Display expressif" },
  { family: "Unbounded", category: "display", weights: [300, 400, 500, 700, 800, 900], hint: "Display wide" },
  { family: "Syne", category: "display", weights: [400, 500, 600, 700, 800], hint: "Display créatif" },
  { family: "Instrument Sans", category: "display", weights: [400, 500, 600, 700], hint: "Magazine moderne" },

  // Serif
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], hint: "Élégant magazine" },
  { family: "Fraunces", category: "serif", weights: [300, 400, 500, 600, 700, 800, 900], hint: "Variable expressif" },
  { family: "Lora", category: "serif", weights: [400, 500, 600, 700], hint: "Lecture longue" },
  { family: "Merriweather", category: "serif", weights: [300, 400, 700, 900], hint: "Lisible sur écran" },
  { family: "Source Serif 4", category: "serif", weights: [300, 400, 500, 600, 700, 900], hint: "Adobe, lecture" },
  { family: "EB Garamond", category: "serif", weights: [400, 500, 600, 700, 800], hint: "Classique français" },
  { family: "Cormorant", category: "serif", weights: [300, 400, 500, 600, 700], hint: "Élégant, fin" },
  { family: "DM Serif Display", category: "serif", weights: [400], hint: "Display serif" },
  { family: "Crimson Text", category: "serif", weights: [400, 600, 700], hint: "Books, académique" },

  // Mono
  { family: "JetBrains Mono", category: "mono", weights: [400, 500, 600, 700, 800], hint: "Code lisible" },
  { family: "Fira Code", category: "mono", weights: [300, 400, 500, 600, 700], hint: "Ligatures" },
  { family: "Source Code Pro", category: "mono", weights: [300, 400, 500, 600, 700, 900], hint: "Adobe" },
  { family: "Geist Mono", category: "mono", weights: [400, 500, 600, 700], hint: "Vercel" },
  { family: "IBM Plex Mono", category: "mono", weights: [300, 400, 500, 600, 700], hint: "IBM" },
  { family: "DM Mono", category: "mono", weights: [300, 400, 500], hint: "DM Sans family" },
  { family: "Space Mono", category: "mono", weights: [400, 700], hint: "Space Grotesk family" },
];

export function fontCategoryLabel(cat: FontCategory): string {
  if (cat === "sans") return "Sans-serif";
  if (cat === "serif") return "Serif";
  if (cat === "display") return "Display";
  if (cat === "mono") return "Monospace";
  return "Handwriting";
}

export function googleFontsUrlForFamily(family: string, weights: number[]): string {
  const familyParam = family.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weights.join(";")}&display=swap`;
}

export function loadSingleFont(font: LibraryFont): void {
  if (typeof document === "undefined") return;
  if (font.isSystem) return;
  const url = googleFontsUrlForFamily(font.family, font.weights);
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// Pour les fonts saisies manuellement (nom Google Font)
export function loadFontByName(family: string, weights: number[] = [400, 500, 600, 700]): void {
  if (typeof document === "undefined") return;
  const url = googleFontsUrlForFamily(family, weights);
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

// Charge dynamiquement les Google Fonts d'une pairing dans <head>
// (1 link par font, déduplication par href)
export function loadFontPairing(pairing: FontPairing): void {
  if (typeof document === "undefined") return;
  const fontsToLoad = [pairing.heading, pairing.body, pairing.mono].filter(
    (f): f is FontDef => Boolean(f?.googleFontsUrl)
  );
  for (const font of fontsToLoad) {
    if (!font.googleFontsUrl) continue;
    if (document.querySelector(`link[href="${font.googleFontsUrl}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = font.googleFontsUrl;
    document.head.appendChild(link);
  }
}
