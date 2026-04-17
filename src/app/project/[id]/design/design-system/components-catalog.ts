import type { ProjectType } from "@/lib/types";

export type AtomicCategory = "atom" | "molecule" | "organism" | "pattern";

export type MvpPriority = "must" | "should" | "nice";

export interface ComponentDefinition {
  slug: string;
  name: string;
  category: AtomicCategory;
  description: string;
  emoji: string;
}

// 30 composants UI essentiels (atoms → organisms)
export const COMPONENTS_CATALOG: ComponentDefinition[] = [
  // Atoms
  { slug: "button", name: "Button", category: "atom", emoji: "🔘", description: "CTA principal, avec variants primary/secondary/ghost" },
  { slug: "input", name: "Input", category: "atom", emoji: "📝", description: "Champ texte single-line avec label + helper" },
  { slug: "textarea", name: "Textarea", category: "atom", emoji: "📄", description: "Champ texte multi-lignes" },
  { slug: "select", name: "Select", category: "atom", emoji: "🔽", description: "Dropdown de choix mutuellement exclusifs" },
  { slug: "checkbox", name: "Checkbox", category: "atom", emoji: "☑️", description: "Choix binaire ou multi-sélection" },
  { slug: "radio", name: "Radio", category: "atom", emoji: "🔘", description: "Choix unique parmi plusieurs" },
  { slug: "toggle", name: "Toggle switch", category: "atom", emoji: "🎚️", description: "On/Off avec feedback instantané" },
  { slug: "badge", name: "Badge", category: "atom", emoji: "🏷️", description: "Label court de statut ou catégorie" },
  { slug: "avatar", name: "Avatar", category: "atom", emoji: "👤", description: "Image ou initiales d'utilisateur" },
  { slug: "chip", name: "Chip / Tag", category: "atom", emoji: "🔖", description: "Filtre compact, supprimable" },
  { slug: "tooltip", name: "Tooltip", category: "atom", emoji: "💬", description: "Hint contextuel au hover/focus" },
  { slug: "spinner", name: "Spinner", category: "atom", emoji: "⏳", description: "Loading indicator < 5s" },
  { slug: "skeleton", name: "Skeleton", category: "atom", emoji: "👻", description: "Placeholder de contenu pendant chargement" },

  // Molecules
  { slug: "card", name: "Card", category: "molecule", emoji: "🪪", description: "Container avec header + content + actions" },
  { slug: "alert", name: "Alert", category: "molecule", emoji: "⚠️", description: "Message inline : info/warning/error/success" },
  { slug: "toast", name: "Toast", category: "molecule", emoji: "🍞", description: "Notification flottante éphémère" },
  { slug: "modal", name: "Modal / Dialog", category: "molecule", emoji: "🪟", description: "Overlay bloquant pour décisions critiques" },
  { slug: "drawer", name: "Drawer", category: "molecule", emoji: "🗄️", description: "Panel latéral coulissant" },
  { slug: "popover", name: "Popover", category: "molecule", emoji: "💭", description: "Flyout non-bloquant attaché à un trigger" },
  { slug: "dropdown", name: "Dropdown menu", category: "molecule", emoji: "📑", description: "Menu d'actions déroulant" },
  { slug: "combobox", name: "Combobox / Autocomplete", category: "molecule", emoji: "🔍", description: "Input + liste filtrable" },
  { slug: "tabs", name: "Tabs", category: "molecule", emoji: "📂", description: "Switch entre vues coordonnées" },
  { slug: "accordion", name: "Accordion", category: "molecule", emoji: "🎛️", description: "Sections collapsibles verticales" },
  { slug: "breadcrumb", name: "Breadcrumb", category: "molecule", emoji: "🍞", description: "Chemin de navigation parent" },
  { slug: "pagination", name: "Pagination", category: "molecule", emoji: "📄", description: "Navigation de liste paginée" },
  { slug: "progress", name: "Progress bar", category: "molecule", emoji: "📊", description: "Avancement d'une tâche longue" },
  { slug: "slider", name: "Slider", category: "molecule", emoji: "🎛️", description: "Sélection d'une valeur numérique" },

  // Organisms
  { slug: "navbar", name: "Navbar / Sidebar", category: "organism", emoji: "🧭", description: "Nav principale de l'app" },
  { slug: "table", name: "Table", category: "organism", emoji: "📋", description: "Tableau dense avec tri, filtres, pagination" },
  { slug: "form", name: "Form", category: "organism", emoji: "📃", description: "Formulaire avec validation inline" },
  { slug: "empty-state", name: "Empty state", category: "organism", emoji: "📭", description: "Écran vide pédagogique avec CTA" },
];

// Recommandation MVP par type projet
export const MVP_BY_TYPE: Record<
  ProjectType,
  { must: string[]; should: string[]; nice: string[] }
> = {
  saas: {
    must: ["button", "input", "select", "card", "modal", "toast", "alert", "navbar", "form", "empty-state"],
    should: ["checkbox", "toggle", "badge", "dropdown", "tabs", "avatar", "tooltip", "table", "skeleton"],
    nice: ["radio", "chip", "popover", "drawer", "combobox", "accordion", "breadcrumb", "pagination", "progress", "slider", "spinner", "textarea"],
  },
  appli: {
    must: ["button", "input", "card", "toast", "modal", "badge", "empty-state", "avatar"],
    should: ["checkbox", "toggle", "chip", "tabs", "drawer", "spinner", "skeleton", "alert"],
    nice: ["radio", "select", "dropdown", "popover", "accordion", "breadcrumb", "pagination", "progress", "slider", "tooltip", "textarea", "combobox", "form", "navbar", "table"],
  },
  outil: {
    must: ["button", "input", "card", "modal", "empty-state", "toast"],
    should: ["checkbox", "select", "badge", "tabs", "tooltip", "alert", "textarea", "form"],
    nice: ["radio", "toggle", "avatar", "chip", "dropdown", "combobox", "popover", "drawer", "accordion", "breadcrumb", "pagination", "progress", "slider", "spinner", "skeleton", "navbar", "table"],
  },
  logiciel: {
    must: ["button", "input", "select", "table", "modal", "form", "alert", "navbar", "empty-state", "toast"],
    should: ["checkbox", "radio", "badge", "tabs", "tooltip", "pagination", "textarea", "breadcrumb"],
    nice: ["toggle", "avatar", "chip", "dropdown", "combobox", "popover", "drawer", "accordion", "progress", "slider", "spinner", "skeleton", "card"],
  },
  business: {
    must: ["button", "input", "card", "form", "table", "alert", "navbar", "empty-state", "modal"],
    should: ["select", "badge", "tabs", "tooltip", "breadcrumb", "pagination", "dropdown", "toast"],
    nice: ["checkbox", "radio", "toggle", "avatar", "chip", "textarea", "combobox", "popover", "drawer", "accordion", "progress", "slider", "spinner", "skeleton"],
  },
};

export const CATEGORY_META: Record<
  AtomicCategory,
  { label: string; emoji: string; description: string }
> = {
  atom: { label: "Atoms", emoji: "⚛️", description: "Briques de base indivisibles" },
  molecule: { label: "Molecules", emoji: "🧪", description: "Combinaisons d'atoms" },
  organism: { label: "Organisms", emoji: "🦠", description: "Sections fonctionnelles" },
  pattern: { label: "Patterns", emoji: "🎨", description: "Compositions récurrentes" },
};
