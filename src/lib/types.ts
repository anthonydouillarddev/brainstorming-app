export type ProjectType = "outil" | "saas" | "appli" | "logiciel" | "business";

export type ProjectStatus =
  | "idea"
  | "validating"
  | "building"
  | "mvp"
  | "testing"
  | "launched"
  | "continuous_improvement"
  | "final";

export type TodoStatus = "todo" | "in_progress" | "blocked" | "done";
export type TodoPriority = "low" | "normal" | "high" | "urgent";
export type ProjectPriority = "none" | "urgent" | "high" | "normal" | "low";
export type TodoKind = "task" | "idea";
export type TodoEffort = "S" | "M" | "L" | "XL";
export type Phase = "discovery" | "build" | "test" | "launch";
export type ScoreMethod = "none" | "ice";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  official_name: string | null;
  type: ProjectType;
  description: string | null;
  status: ProjectStatus;
  north_star: string | null;
  next_action: string | null;
  deadline: string | null;
  disabled_sections: string[];
  metric_users: number | null;
  metric_mrr: number | null;
  priority: ProjectPriority;
  position: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  project_id: string | null;
  kind: TodoKind;
  text: string;
  description: string | null;
  problem: string | null;
  effort: TodoEffort | null;
  tags: string[];
  done: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  deadline: string | null;
  phase: Phase | null;
  score_method: ScoreMethod;
  ice_impact: number | null;
  ice_confidence: number | null;
  ice_ease: number | null;
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  context: string | null;
  options: string | null;
  decision: string;
  rationale: string | null;
  decided_at: string;
  created_at: string;
}

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface RoadmapItem {
  id: string;
  project_id: string;
  quarter: Quarter;
  year: number;
  objective: string;
  achieved: boolean;
  position: number;
  created_at: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface Risk {
  id: string;
  project_id: string;
  title: string;
  probability: RiskLevel;
  impact: RiskLevel;
  mitigation: string | null;
  resolved_at: string | null;
  created_at: string;
}

export type DevItemKind = "idea" | "link" | "doc" | "info" | "pref";
export type DevLinkStatus = "not_opened" | "in_progress" | "done";

export interface DevItem {
  id: string;
  user_id: string;
  kind: DevItemKind;
  title: string;
  content: string | null;
  url: string | null;
  tags: string[];
  status: DevLinkStatus | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export const DEV_KINDS: {
  value: DevItemKind;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { value: "idea", label: "Idées", emoji: "💡", description: "Skills, agents, nouvelles idées de dev" },
  { value: "link", label: "Liens", emoji: "🔗", description: "Sites de codage, exemples, ressources" },
  { value: "doc", label: "Docs", emoji: "📄", description: "Notes longues, documentation perso" },
  { value: "info", label: "Infos", emoji: "📝", description: "Notes rapides, infos diverses" },
  { value: "pref", label: "Prefs", emoji: "🎨", description: "Couleurs, styles, design préférés" },
];

export const DEV_LINK_STATUSES: {
  value: DevLinkStatus;
  label: string;
  emoji: string;
}[] = [
  { value: "not_opened", label: "Pas ouvert", emoji: "⚪" },
  { value: "in_progress", label: "En cours", emoji: "🔵" },
  { value: "done", label: "Traité", emoji: "✅" },
];

export const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

export const RISK_LEVELS: { value: RiskLevel; label: string; weight: number }[] = [
  { value: "low", label: "Faible", weight: 1 },
  { value: "medium", label: "Moyen", weight: 2 },
  { value: "high", label: "Fort", weight: 3 },
];

export function riskCriticality(risk: Pick<Risk, "probability" | "impact">): number {
  const p = RISK_LEVELS.find((r) => r.value === risk.probability)?.weight ?? 1;
  const i = RISK_LEVELS.find((r) => r.value === risk.impact)?.weight ?? 1;
  return p * i;
}

export function riskColor(criticality: number): { bg: string; text: string; border: string } {
  if (criticality >= 6) return { bg: "bg-red-500/25", text: "text-red-600 dark:text-red-400", border: "border-red-500/50" };
  if (criticality >= 4) return { bg: "bg-orange-500/25", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/50" };
  if (criticality >= 2) return { bg: "bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-500/50" };
  return { bg: "bg-green-500/20", text: "text-green-700 dark:text-green-400", border: "border-green-500/50" };
}

export const PROJECT_PRIORITIES: {
  value: ProjectPriority;
  label: string;
  short: string;
  emoji: string;
  rank: number;
  color: string;
}[] = [
  { value: "urgent", label: "P1 — Prioritaire", short: "P1", emoji: "🔴", rank: 4, color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40" },
  { value: "high", label: "P2 — Important", short: "P2", emoji: "🟠", rank: 3, color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40" },
  { value: "normal", label: "P3 — Normal", short: "P3", emoji: "🔵", rank: 2, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40" },
  { value: "low", label: "P4 — Plus tard", short: "P4", emoji: "⚪", rank: 1, color: "bg-gray-500/15 text-muted border-border" },
  { value: "none", label: "Non classé", short: "—", emoji: "⚫", rank: 0, color: "bg-background/60 text-muted border-border" },
];

export function priorityRank(priority: ProjectPriority): number {
  return PROJECT_PRIORITIES.find((p) => p.value === priority)?.rank ?? 0;
}

export interface ProjectHealthInputs {
  blockingCount: number;
  criticalRiskCount: number;
  deadline: string | null;
  status: ProjectStatus;
}

export function projectHealthScore(inputs: ProjectHealthInputs): number {
  let score = 0;
  score += inputs.blockingCount * 3;
  score += inputs.criticalRiskCount * 2;
  if (inputs.deadline) {
    const days = Math.ceil(
      (new Date(inputs.deadline).getTime() - Date.now()) / 86400000
    );
    if (days < 0) score += 5;
    else if (days <= 30) score += 2;
  }
  if (["building", "mvp", "testing"].includes(inputs.status)) score += 1;
  return score;
}

export function healthScoreTone(score: number): {
  badge: string;
  label: string;
} {
  if (score >= 10) return { badge: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40", label: "Critique" };
  if (score >= 5) return { badge: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40", label: "Attention" };
  if (score >= 2) return { badge: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/40", label: "À surveiller" };
  return { badge: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/40", label: "Sain" };
}

export const PROJECT_TYPES: { value: ProjectType; label: string; emoji: string; description: string }[] = [
  { value: "outil", label: "Outil perso", emoji: "🛠️", description: "Outil de productivité personnel, pas de marché visé" },
  { value: "saas", label: "SaaS", emoji: "☁️", description: "Produit SaaS complet avec monétisation" },
  { value: "appli", label: "Application", emoji: "📱", description: "Application mobile ou desktop pour utilisateurs" },
  { value: "logiciel", label: "Logiciel métier", emoji: "💼", description: "Logiciel métier ou interne, souvent B2B" },
  { value: "business", label: "Business non-tech", emoji: "🏪", description: "Service, consulting, e-commerce physique" },
];

export const PROJECT_STATUSES: {
  value: ProjectStatus;
  label: string;
  emoji: string;
  phase: Phase;
  badge: string;
}[] = [
  { value: "idea", label: "Idée", emoji: "💭", phase: "discovery", badge: "bg-gray-500/90" },
  { value: "validating", label: "Validation", emoji: "🔍", phase: "discovery", badge: "bg-yellow-600/90" },
  { value: "building", label: "En dev", emoji: "🛠️", phase: "build", badge: "bg-blue-600/90" },
  { value: "mvp", label: "MVP", emoji: "🎯", phase: "build", badge: "bg-indigo-600/90" },
  { value: "testing", label: "Tests", emoji: "🧪", phase: "test", badge: "bg-purple-600/90" },
  { value: "launched", label: "Lancé", emoji: "🚀", phase: "launch", badge: "bg-green-600/90" },
  { value: "continuous_improvement", label: "Amélioration", emoji: "🔄", phase: "launch", badge: "bg-teal-600/90" },
  { value: "final", label: "Finalisé", emoji: "✅", phase: "launch", badge: "bg-emerald-700/90" },
];

export const PHASES: { value: Phase; label: string; emoji: string }[] = [
  { value: "discovery", label: "Discovery", emoji: "🧭" },
  { value: "build", label: "Build", emoji: "🏗️" },
  { value: "test", label: "Test", emoji: "🧪" },
  { value: "launch", label: "Launch", emoji: "🚀" },
];

export const TODO_STATUSES: { value: TodoStatus; label: string; emoji: string; color: string }[] = [
  { value: "todo", label: "À faire", emoji: "⚪", color: "text-muted" },
  { value: "in_progress", label: "En cours", emoji: "🔵", color: "text-blue-500" },
  { value: "blocked", label: "Bloqué", emoji: "🚧", color: "text-red-500" },
  { value: "done", label: "Terminé", emoji: "✅", color: "text-green-500" },
];

export const TODO_KINDS: {
  value: TodoKind;
  label: string;
  emoji: string;
  title: string;
  addPlaceholder: string;
}[] = [
  {
    value: "task",
    label: "Tâches",
    emoji: "📋",
    title: "Tâches du projet",
    addPlaceholder: "Ajouter une tâche...",
  },
  {
    value: "idea",
    label: "Idées",
    emoji: "💡",
    title: "Idées de fonctions",
    addPlaceholder: "Ajouter une idée de fonction...",
  },
];

export const TODO_EFFORTS: { value: TodoEffort; label: string; emoji: string; hint: string }[] = [
  { value: "S", label: "S", emoji: "🟢", hint: "Quelques heures" },
  { value: "M", label: "M", emoji: "🟡", hint: "1-2 jours" },
  { value: "L", label: "L", emoji: "🟠", hint: "Une semaine" },
  { value: "XL", label: "XL", emoji: "🔴", hint: "Plusieurs semaines" },
];

export const TODO_PRIORITIES: { value: TodoPriority; label: string; short: string; emoji: string }[] = [
  { value: "urgent", label: "P1 — Urgent", short: "P1", emoji: "🔴" },
  { value: "high", label: "P2 — Haute", short: "P2", emoji: "🟠" },
  { value: "normal", label: "P3 — Normale", short: "P3", emoji: "🔵" },
  { value: "low", label: "P4 — Basse", short: "P4", emoji: "⚪" },
];

export function statusPhase(status: ProjectStatus): Phase {
  return PROJECT_STATUSES.find((s) => s.value === status)?.phase ?? "discovery";
}

export function statusIndex(status: ProjectStatus): number {
  const idx = PROJECT_STATUSES.findIndex((s) => s.value === status);
  return idx < 0 ? 0 : idx;
}

// ---------- User Preferences ----------

export type Theme = "light" | "dark" | "system";
export type DisplayDensity = "compact" | "normal" | "comfortable";
export type DefaultTaskView = "list" | "kanban";
export type UserRole = "admin" | "free" | "demo" | "pro" | "vip";

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: Theme;
  display_density: DisplayDensity;
  default_task_view: DefaultTaskView;
  role: UserRole;
  locale: string;
  created_at: string;
  updated_at: string;
}

export const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Clair", icon: "sun" },
  { value: "dark", label: "Sombre", icon: "moon" },
  { value: "system", label: "Système", icon: "monitor" },
];

export const DISPLAY_DENSITIES: { value: DisplayDensity; label: string; description: string }[] = [
  { value: "compact", label: "Compact", description: "Moins d'espace, plus de contenu" },
  { value: "normal", label: "Normal", description: "Espacement par défaut" },
  { value: "comfortable", label: "Confortable", description: "Plus d'espace, lecture facile" },
];

export const DEFAULT_PREFERENCES: Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at"> = {
  theme: "system",
  display_density: "normal",
  default_task_view: "list",
  role: "admin",
  locale: "fr",
};
