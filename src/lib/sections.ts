export interface SectionDef {
  key: string;
  title: string;
  emoji: string;
  color: string;
  placeholder: string;
}

export const SECTIONS: SectionDef[] = [
  {
    key: "problem",
    title: "Le Problème",
    emoji: "🔴",
    color: "border-red-500",
    placeholder: "Quel problème concret est résolu ? Qui souffre ? Comment le résolvent-ils aujourd'hui ?",
  },
  {
    key: "solution",
    title: "La Solution",
    emoji: "💡",
    color: "border-yellow-500",
    placeholder: "Description en 2-3 phrases. Valeur unique. Pourquoi choisir ce produit ?",
  },
  {
    key: "target",
    title: "Cible & Marché",
    emoji: "🎯",
    color: "border-blue-500",
    placeholder: "Persona principal (qui, douleur, objectif, budget). B2C/B2B ? Taille du marché ?",
  },
  {
    key: "mvp",
    title: "MVP — Fonctionnalités",
    emoji: "🛠️",
    color: "border-green-500",
    placeholder: "Les 3-5 features du MVP. Ce qu'on ne construit PAS en V1. La feature unique indispensable.",
  },
  {
    key: "competition",
    title: "Concurrence",
    emoji: "⚔️",
    color: "border-purple-500",
    placeholder: "Concurrents directs + indirects. Leur faiblesse. Votre avantage compétitif.",
  },
  {
    key: "business",
    title: "Business Model",
    emoji: "💰",
    color: "border-orange-500",
    placeholder: "Modèle de revenus (abo/usage/freemium). Plans tarifaires. Objectif MRR à 6 et 12 mois.",
  },
  {
    key: "gtm",
    title: "Go-to-Market",
    emoji: "🚀",
    color: "border-cyan-500",
    placeholder: "Comment atteindre les 10 premiers clients ? Canal prioritaire ? Headline landing page ?",
  },
  {
    key: "validation",
    title: "Validation & PMF",
    emoji: "✅",
    color: "border-emerald-500",
    placeholder: "Hypothèses à valider. Méthode (landing page, interviews, prototype). Signaux PMF obtenus.",
  },
  {
    key: "tech",
    title: "Stack Technique",
    emoji: "⚙️",
    color: "border-slate-500",
    placeholder: "Framework, DB, Auth, Paiements, Email, Hébergement. Repo GitHub. URLs prod/staging.",
  },
  {
    key: "legal",
    title: "Légal & RGPD",
    emoji: "📜",
    color: "border-red-400",
    placeholder: "Structure juridique. CGU/CGV. Données collectées. Conformité RGPD. Cookie consent.",
  },
  {
    key: "branding",
    title: "Nom & Branding",
    emoji: "🎨",
    color: "border-pink-500",
    placeholder: "Nom de domaine. Couleurs. Police. Logo. Tagline.",
  },
  {
    key: "resources",
    title: "Ressources & Liens",
    emoji: "📎",
    color: "border-indigo-500",
    placeholder: "Inspirations. Documentations utiles. Études de marché. Liens importants.",
  },
  {
    key: "journal",
    title: "Journal de Bord",
    emoji: "📓",
    color: "border-amber-500",
    placeholder: "Décisions importantes, pivots, apprentissages. Chronologique.",
  },
  {
    key: "dump",
    title: "Idées en vrac",
    emoji: "🧠",
    color: "border-violet-500",
    placeholder: "Toutes les idées sans filtre — à trier plus tard.",
  },
];
