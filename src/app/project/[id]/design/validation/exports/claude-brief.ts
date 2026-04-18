import type { Project } from "@/lib/types";
import type { ValidationState } from "../state";
import {
  FINDING_SEVERITY_META,
  HEURISTIC_META,
  PMF_METRIC_META,
  averageSusScore,
  susGrade,
} from "../state";

export function exportValidationClaudeBrief(
  state: ValidationState,
  project: Project
): string {
  const lines: string[] = [];

  lines.push(`# Brief validation — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas analyser les résultats de validation (tests users, SUS, heuristiques, PMF) et proposer un plan"
  );
  lines.push(
    "de remediation priorisé. Focus sur les findings critiques/sérieux. Références WCAG/Nielsen attendues."
  );
  lines.push("");

  // User tests findings critiques
  const criticalFindings = state.userTests
    .flatMap((t) =>
      t.findings
        .filter(
          (f) => (f.severity === "critical" || f.severity === "serious") && !f.fixed
        )
        .map((f) => ({ ...f, test: t.title }))
    );
  if (criticalFindings.length > 0) {
    lines.push("## 🔴 Findings critiques/sérieux non corrigés");
    lines.push("");
    for (const f of criticalFindings) {
      const smeta = FINDING_SEVERITY_META[f.severity];
      lines.push(
        `- ${smeta.emoji} **[${f.test}]** ${f.description} · ${f.frequency}× participant(s)`
      );
    }
    lines.push("");
  }

  // SUS
  if (state.susResponses.length > 0) {
    const avg = averageSusScore(state.susResponses);
    const grade = susGrade(avg);
    lines.push(`## 📊 SUS Score : ${avg}/100 (Grade ${grade.grade} · ${grade.label})`);
    lines.push("");
    lines.push(
      `Sample : ${state.susResponses.length} répondant${state.susResponses.length > 1 ? "s" : ""}. Bench industrie = 68.`
    );
    if (avg < 68) {
      lines.push(`⚠️ Sous le bench · refonte UX nécessaire.`);
    }
    lines.push("");
  }

  // Heuristics failed
  const failedHeuristics = state.heuristicEvals.filter(
    (h) =>
      (h.severity === "critical" || h.severity === "serious") && !h.resolved
  );
  if (failedHeuristics.length > 0) {
    lines.push("## 🔎 Heuristiques Nielsen en échec");
    lines.push("");
    for (const h of failedHeuristics) {
      const hmeta = HEURISTIC_META[h.heuristic];
      lines.push(`### ${hmeta.label}`);
      if (h.evidence) lines.push(`- **Evidence** : ${h.evidence}`);
      if (h.suggestion) lines.push(`- **Suggestion** : ${h.suggestion}`);
      lines.push("");
    }
  }

  // PMF
  if (state.pmfMetrics.length > 0) {
    lines.push("## 🎯 PMF metrics");
    lines.push("");
    for (const m of state.pmfMetrics) {
      const meta = PMF_METRIC_META[m.kind];
      const hit = m.sampleSize >= 30 && m.value >= m.target;
      lines.push(
        `- ${hit ? "✅" : "⚠️"} **${meta.label}** : ${m.value}${meta.unit} (target ${m.target}${meta.unit}) · n=${m.sampleSize}`
      );
    }
    lines.push("");
  }

  if (state.roadmap.length > 0) {
    const open = state.roadmap.filter((r) => r.status !== "done");
    if (open.length > 0) {
      lines.push("## Validation roadmap (plan d'action en cours)");
      lines.push("");
      for (const bucket of ["now", "sprint", "quarter", "backlog"] as const) {
        const items = open.filter((r) => r.bucket === bucket);
        if (items.length === 0) continue;
        lines.push(`### ${bucket}`);
        for (const r of items) {
          lines.push(
            `- ${FINDING_SEVERITY_META[r.severity].emoji} **${r.title}** · ${r.source || "–"}${r.effort ? ` · effort ${r.effort}` : ""}`
          );
        }
        lines.push("");
      }
    }
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Priorise les findings pour les 2 prochains sprints »,"
  );
  lines.push(
    "« Génère un questionnaire Sean Ellis », « Suggère des améliorations pour remonter le SUS », etc.)*"
  );

  return lines.join("\n");
}
