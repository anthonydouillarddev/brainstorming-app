import type { TodoPriority } from "./types";

export type DeadlineUrgency = "overdue" | "today" | "soon" | "near" | "far";

export interface DeadlineStatus {
  urgency: DeadlineUrgency;
  days: number;
  label: string;
  emoji: string;
  className: string;
}

function daysUntil(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(`${deadline}T00:00:00`);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export function deadlineStatus(deadline: string | null): DeadlineStatus | null {
  if (!deadline) return null;
  const days = daysUntil(deadline);
  if (days < 0) {
    return {
      urgency: "overdue",
      days,
      label: `Dépassée de ${-days}j`,
      emoji: "🔴",
      className: "bg-red-500/15 text-red-500 border border-red-500/40",
    };
  }
  if (days === 0) {
    return {
      urgency: "today",
      days,
      label: "Aujourd'hui",
      emoji: "⏰",
      className: "bg-red-500/15 text-red-500 border border-red-500/40",
    };
  }
  if (days <= 3) {
    return {
      urgency: "soon",
      days,
      label: `Dans ${days}j`,
      emoji: "⏰",
      className: "bg-orange-500/15 text-orange-600 border border-orange-500/40",
    };
  }
  if (days <= 14) {
    return {
      urgency: "near",
      days,
      label: `Dans ${days}j`,
      emoji: "📅",
      className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40",
    };
  }
  return {
    urgency: "far",
    days,
    label: `Dans ${days}j`,
    emoji: "📅",
    className: "bg-background/60 text-muted border border-border",
  };
}

// Seuil de jours avant deadline à partir duquel on marque une tâche urgente.
// Les priorités fortes déclenchent plus tôt, la complexité (ease ICE bas)
// rallonge le délai de préparation.
function urgencyThreshold(priority: TodoPriority, iceEase: number | null): number {
  const base = priority === "urgent" ? 3 : priority === "high" ? 2 : priority === "normal" ? 1 : 0;
  if (iceEase == null) return base;
  if (iceEase <= 3) return base + 2; // très complexe
  if (iceEase >= 8) return Math.max(0, base - 1); // trivial
  return base;
}

export function todoUrgency(todo: {
  deadline: string | null;
  priority: TodoPriority;
  ice_ease: number | null;
  status: string;
}): DeadlineStatus | null {
  if (!todo.deadline || todo.status === "done") return null;
  const days = daysUntil(todo.deadline);

  if (days < 0) {
    return {
      urgency: "overdue",
      days,
      label: `Dépassée (${-days}j)`,
      emoji: "🔴",
      className: "bg-red-500/20 text-red-500 border border-red-500/50",
    };
  }
  if (days === 0) {
    return {
      urgency: "today",
      days,
      label: "Aujourd'hui",
      emoji: "⏰",
      className: "bg-red-500/15 text-red-500 border border-red-500/40",
    };
  }

  const threshold = urgencyThreshold(todo.priority, todo.ice_ease);
  if (threshold <= 0) {
    return {
      urgency: "far",
      days,
      label: `Dans ${days}j`,
      emoji: "📅",
      className: "bg-background/60 text-muted border border-border",
    };
  }

  const criticalThreshold = Math.max(0, Math.floor(threshold / 2));
  if (days <= criticalThreshold) {
    return {
      urgency: "soon",
      days,
      label: `Urgent — ${days}j`,
      emoji: "🔴",
      className: "bg-red-500/15 text-red-500 border border-red-500/40",
    };
  }
  if (days <= threshold) {
    return {
      urgency: "near",
      days,
      label: `Commencer — ${days}j`,
      emoji: "🟠",
      className: "bg-orange-500/15 text-orange-600 border border-orange-500/40",
    };
  }
  return {
    urgency: "far",
    days,
    label: `Dans ${days}j`,
    emoji: "📅",
    className: "bg-background/60 text-muted border border-border",
  };
}
