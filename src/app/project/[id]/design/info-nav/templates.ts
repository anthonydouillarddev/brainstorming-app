import type { ProjectType } from "@/lib/types";
import { makeScreenId, toSlug, type SitemapScreen, type NavPattern } from "./state";

export interface ScreenTemplate {
  title: string;
  emoji: string;
  description: string;
  isPrimaryNav: boolean;
}

// 5-8 templates d'écran par type projet, ordonnés par fréquence d'usage
export const SCREEN_TEMPLATES: Record<ProjectType, ScreenTemplate[]> = {
  saas: [
    { title: "Accueil", emoji: "🏠", description: "Dashboard principal", isPrimaryNav: true },
    { title: "Projets", emoji: "📂", description: "Liste des projets / ressources", isPrimaryNav: true },
    { title: "Équipe", emoji: "👥", description: "Gestion des membres / invites", isPrimaryNav: true },
    { title: "Facturation", emoji: "💳", description: "Abonnement, factures", isPrimaryNav: true },
    { title: "Réglages", emoji: "⚙️", description: "Profil + préférences", isPrimaryNav: true },
    { title: "Projet détail", emoji: "📄", description: "Page d'un projet spécifique", isPrimaryNav: false },
    { title: "Intégrations", emoji: "🔌", description: "Connecteurs tiers", isPrimaryNav: false },
  ],
  appli: [
    { title: "Feed", emoji: "📱", description: "Page d'accueil principale", isPrimaryNav: true },
    { title: "Recherche", emoji: "🔍", description: "Search + filtres", isPrimaryNav: true },
    { title: "Créer", emoji: "➕", description: "Action principale de création", isPrimaryNav: true },
    { title: "Notifs", emoji: "🔔", description: "Activité et notifications", isPrimaryNav: true },
    { title: "Profil", emoji: "👤", description: "Profil utilisateur", isPrimaryNav: true },
    { title: "Détail", emoji: "📄", description: "Page d'un contenu", isPrimaryNav: false },
  ],
  outil: [
    { title: "Accueil", emoji: "🏠", description: "Vue d'ensemble", isPrimaryNav: true },
    { title: "Liste", emoji: "📋", description: "Tes items (projets, notes, tâches)", isPrimaryNav: true },
    { title: "Nouveau", emoji: "➕", description: "Création rapide", isPrimaryNav: true },
    { title: "Réglages", emoji: "⚙️", description: "Préférences", isPrimaryNav: true },
    { title: "Détail", emoji: "📄", description: "Édition d'un item", isPrimaryNav: false },
  ],
  logiciel: [
    { title: "Tableau de bord", emoji: "📊", description: "KPIs métier", isPrimaryNav: true },
    { title: "Dossiers", emoji: "📁", description: "Liste des dossiers clients", isPrimaryNav: true },
    { title: "Rapports", emoji: "📑", description: "Rapports d'activité", isPrimaryNav: true },
    { title: "Paramètres", emoji: "⚙️", description: "Config logiciel", isPrimaryNav: true },
    { title: "Administration", emoji: "🔒", description: "Gestion users/droits", isPrimaryNav: true },
    { title: "Dossier détail", emoji: "📄", description: "Page d'un dossier", isPrimaryNav: false },
  ],
  business: [
    { title: "Cockpit", emoji: "🎯", description: "Vue synthèse business", isPrimaryNav: true },
    { title: "Prospects", emoji: "🧲", description: "Pipeline commercial", isPrimaryNav: true },
    { title: "Clients", emoji: "🤝", description: "Base clients active", isPrimaryNav: true },
    { title: "Finance", emoji: "💰", description: "Revenue + factures", isPrimaryNav: true },
    { title: "Analytics", emoji: "📊", description: "Reporting stratégique", isPrimaryNav: true },
    { title: "Client détail", emoji: "📄", description: "Fiche client complète", isPrimaryNav: false },
  ],
};

// Nav pattern recommandé par type projet
export const NAV_PATTERN_DEFAULT: Record<ProjectType, NavPattern> = {
  saas: "sidebar",
  appli: "bottom-nav",
  outil: "top-tabs",
  logiciel: "sidebar",
  business: "sidebar",
};

// Dictionnaire de labels jargon → user (le V2 l'utilise)
export const LABEL_DICTIONARY: Array<{ internal: string; userFacing: string; context: string }> = [
  { internal: "Dashboard", userFacing: "Accueil", context: "Page d'atterrissage" },
  { internal: "Settings", userFacing: "Réglages", context: "Config compte" },
  { internal: "Preferences", userFacing: "Préférences", context: "Config compte" },
  { internal: "Entities", userFacing: "Choses", context: "Débutant friendly" },
  { internal: "Workspace", userFacing: "Mon espace", context: "Si app mono-user" },
  { internal: "Manager", userFacing: "Gestion de", context: "Précise l'objet" },
  { internal: "Records", userFacing: "Fiches", context: "Base de données" },
  { internal: "Inbox", userFacing: "Messages", context: "Ou « À traiter »" },
  { internal: "Overview", userFacing: "Vue d'ensemble", context: "Plus concret" },
  { internal: "Workflow", userFacing: "Parcours", context: "Éviter jargon" },
  { internal: "Metrics", userFacing: "Stats", context: "Plus accessible" },
  { internal: "Access control", userFacing: "Permissions", context: "Admin" },
];

// Retourne un screen complet prêt à insérer depuis un template
export function screenFromTemplate(
  template: ScreenTemplate,
  parentId: string | null,
  position: number
): SitemapScreen {
  return {
    id: makeScreenId(),
    title: template.title,
    slug: toSlug(template.title),
    emoji: template.emoji,
    parentId,
    position,
    isPrimaryNav: template.isPrimaryNav,
    description: template.description,
  };
}
