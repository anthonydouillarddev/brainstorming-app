export interface ColorCombo {
  id: string;
  name: string;
  style:
    | "vintage"
    | "modern"
    | "natural"
    | "pastel"
    | "corporate"
    | "playful"
    | "tech"
    | "ancient"
    | "brand"
    | "custom";
  colors: string[];
  note?: string;
}

export const COLOR_COMBOS: ColorCombo[] = [
  // Vintage
  {
    id: "vintage-sage-coral",
    name: "Sage & Coral",
    style: "vintage",
    colors: ["#8fbc8f", "#d3d3d3", "#e2725b", "#f1dbd0", "#2f4f4f"],
    note: "Palette douce et nostalgique, sauge + terracotta doux",
  },
  {
    id: "vintage-dusty-rose",
    name: "Dusty Rose",
    style: "vintage",
    colors: ["#c9a0a0", "#e8c4c4", "#f5e6d3", "#8b5a5a", "#4a3333"],
  },
  {
    id: "vintage-sepia",
    name: "Sepia",
    style: "vintage",
    colors: ["#704214", "#a0724a", "#d4a574", "#f0d9b5", "#2c1810"],
  },

  // Modern
  {
    id: "modern-punk",
    name: "Punk Minimal",
    style: "modern",
    colors: ["#111827", "#ff6b5b"],
    note: "Dark + accent saturé, le classique SaaS 2024",
  },
  {
    id: "modern-linear",
    name: "Linear",
    style: "modern",
    colors: ["#0E0E10", "#5E6AD2", "#F8F9FA"],
    note: "La marque Linear, référence SaaS premium",
  },
  {
    id: "modern-vercel",
    name: "Vercel",
    style: "modern",
    colors: ["#000000", "#FFFFFF", "#0070F3"],
  },

  // Natural / Earthy
  {
    id: "natural-petrol-clay",
    name: "Petrol & Clay",
    style: "natural",
    colors: ["#0d2b35", "#f3e9e2", "#c9886b"],
    note: "Bleu pétrole + terre cuite, équilibre froid/chaud",
  },
  {
    id: "natural-forest",
    name: "Forest",
    style: "natural",
    colors: ["#2D5016", "#6B8E23", "#C2B280", "#F5F5DC"],
  },
  {
    id: "natural-desert",
    name: "Desert",
    style: "natural",
    colors: ["#C4A57B", "#8B6F4E", "#D9C7A7", "#3E2F1C"],
  },

  // Pastel
  {
    id: "pastel-candy",
    name: "Candy",
    style: "pastel",
    colors: ["#FFD6E7", "#C7CEEA", "#B5EAD7", "#FFDAC1", "#FFFFFF"],
  },
  {
    id: "pastel-mint",
    name: "Mint Latte",
    style: "pastel",
    colors: ["#B8E0D2", "#EBE5C2", "#D6CDA4", "#95B8D1", "#FFFFFF"],
  },

  // Corporate
  {
    id: "corporate-navy",
    name: "Navy Corporate",
    style: "corporate",
    colors: ["#1E3A5F", "#2E86AB", "#A8DADC", "#F1FAEE"],
  },
  {
    id: "corporate-stripe",
    name: "Stripe",
    style: "corporate",
    colors: ["#635BFF", "#0A2540", "#F6F9FC"],
  },

  // Playful
  {
    id: "playful-citrus",
    name: "Citrus Pop",
    style: "playful",
    colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89"],
  },
  {
    id: "playful-cyberpunk",
    name: "Cyberpunk",
    style: "playful",
    colors: ["#FF006E", "#8338EC", "#3A86FF", "#1A1A2E"],
  },

  // Tech
  {
    id: "tech-ocean",
    name: "Ocean Tech",
    style: "tech",
    colors: ["#00B4D8", "#0077B6", "#03045E", "#CAF0F8"],
  },

  // Ancient
  {
    id: "ancient-gold",
    name: "Ancient Gold",
    style: "ancient",
    colors: ["#8B4513", "#D2B48C", "#F5DEB3", "#2F1B14"],
  },
  {
    id: "ancient-pompeii",
    name: "Pompeii",
    style: "ancient",
    colors: ["#7C2D2D", "#C89F73", "#F4E4C1", "#2B1810"],
  },

  // Brand — Mindeck
  {
    id: "brand-mindeck-light",
    name: "Mindeck Clair",
    style: "brand",
    colors: ["#E8E0D8", "#7C6A4F", "#d4cbc0", "#1a1a1a"],
    note: "Palette actuelle de Mindeck en mode clair",
  },
  {
    id: "brand-mindeck-dark",
    name: "Mindeck Sombre",
    style: "brand",
    colors: ["#0c0c14", "#C9956B", "#2d2d40", "#e5e7eb"],
    note: "Palette actuelle de Mindeck en mode sombre",
  },
];

export const COMBO_STYLES: { value: ColorCombo["style"]; label: string; emoji: string }[] = [
  { value: "brand", label: "Marque", emoji: "🏷️" },
  { value: "modern", label: "Moderne", emoji: "✨" },
  { value: "vintage", label: "Vintage", emoji: "📻" },
  { value: "natural", label: "Naturel", emoji: "🌿" },
  { value: "pastel", label: "Pastel", emoji: "🌸" },
  { value: "corporate", label: "Corporate", emoji: "💼" },
  { value: "playful", label: "Joueur", emoji: "🎨" },
  { value: "tech", label: "Tech", emoji: "⚡" },
  { value: "ancient", label: "Ancien", emoji: "🏛️" },
];
