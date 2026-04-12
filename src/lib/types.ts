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
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  project_id: string | null;
  text: string;
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
  created_at: string;
}

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
  if (criticality >= 6) return { bg: "bg-red-500/15", text: "text-red-500", border: "border-red-500/40" };
  if (criticality >= 4) return { bg: "bg-orange-500/15", text: "text-orange-500", border: "border-orange-500/40" };
  if (criticality >= 2) return { bg: "bg-yellow-500/15", text: "text-yellow-500", border: "border-yellow-500/40" };
  return { bg: "bg-green-500/15", text: "text-green-500", border: "border-green-500/40" };
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
