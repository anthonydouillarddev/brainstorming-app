import type { Project } from "@/lib/types";
import type { ValidationState } from "../state";
import {
  FINDING_SEVERITY_META,
  HEURISTIC_META,
  PMF_METRIC_META,
  ROADMAP_BUCKET_META,
  TEST_METHOD_META,
  TEST_STATUS_META,
  averageSusScore,
  computeSusScore,
  susGrade,
} from "../state";

export function exportValidationMd(
  state: ValidationState,
  project: Project
): string {
  const lines: string[] = [];
  lines.push(`# Validation — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "> Généré par Mindeck · Chap. 12 Validation (user tests · SUS · heuristics · PMF)"
  );
  lines.push("");

  if (state.userTests.length > 0) {
    lines.push("## 🧑‍🔬 Tests utilisateurs");
    lines.push("");
    for (const t of state.userTests) {
      lines.push(`### ${t.title || "(sans titre)"}`);
      lines.push("");
      lines.push(`- **Méthode** : ${TEST_METHOD_META[t.method].label}`);
      lines.push(`- **Statut** : ${TEST_STATUS_META[t.status].label}`);
      lines.push(`- **Goal** : ${t.goal || "–"}`);
      lines.push(`- **Participants** : ${t.participantCount}`);
      lines.push(`- **Completion rate** : ${t.completionRate}%`);
      lines.push(`- **Time on task** : ${t.timeOnTaskSec}s`);
      if (t.findings.length > 0) {
        lines.push("");
        lines.push("**Findings**");
        lines.push("");
        lines.push("| Sévérité | Fréquence | Description | Corrigé |");
        lines.push("|---|---|---|---|");
        for (const f of t.findings) {
          const fmeta = FINDING_SEVERITY_META[f.severity];
          lines.push(
            `| ${fmeta.emoji} ${fmeta.label} | ${f.frequency}× | ${f.description} | ${f.fixed ? "✓" : "–"} |`
          );
        }
      }
      if (t.notes) {
        lines.push("");
        lines.push(`> ${t.notes}`);
      }
      lines.push("");
    }
  }

  if (state.susResponses.length > 0) {
    const avg = averageSusScore(state.susResponses);
    const grade = susGrade(avg);
    lines.push("## 📊 SUS (System Usability Scale)");
    lines.push("");
    lines.push(`**Score moyen : ${avg}/100 · Grade ${grade.grade} (${grade.label})**`);
    lines.push("");
    lines.push(`Bench industrie : 68 (moyen) · 72.6 (good) · 80.3+ (excellent)`);
    lines.push("");
    lines.push("| Participant | Score | Grade |");
    lines.push("|---|---|---|");
    for (const r of state.susResponses) {
      const score = computeSusScore(r.answers);
      const g = susGrade(score);
      lines.push(`| ${r.participantLabel || "?"} | ${score}/100 | ${g.grade} |`);
    }
    lines.push("");
  }

  if (state.heuristicEvals.length > 0) {
    lines.push("## 🔎 Heuristiques Nielsen");
    lines.push("");
    lines.push("| Heuristique | Sévérité | Résolu | Evidence | Suggestion |");
    lines.push("|---|---|---|---|---|");
    for (const h of state.heuristicEvals) {
      const hmeta = HEURISTIC_META[h.heuristic];
      const sevLabel =
        h.severity === "none"
          ? "—"
          : `${FINDING_SEVERITY_META[h.severity].emoji} ${FINDING_SEVERITY_META[h.severity].label}`;
      lines.push(
        `| ${hmeta.label} | ${sevLabel} | ${h.resolved ? "✓" : "–"} | ${h.evidence || "–"} | ${h.suggestion || "–"} |`
      );
    }
    lines.push("");
  }

  if (state.pmfMetrics.length > 0) {
    lines.push("## 🎯 PMF metrics");
    lines.push("");
    lines.push("| Métrique | Valeur | Target | Échantillon | Mesuré le |");
    lines.push("|---|---|---|---|---|");
    for (const m of state.pmfMetrics) {
      const meta = PMF_METRIC_META[m.kind];
      lines.push(
        `| ${meta.emoji} ${meta.label} | ${m.value}${meta.unit} | ${m.target}${meta.unit} | ${m.sampleSize} | ${m.measuredAt} |`
      );
    }
    lines.push("");
  }

  if (state.roadmap.length > 0) {
    lines.push("## 🗺️ Validation roadmap");
    lines.push("");
    for (const bucket of ["now", "sprint", "quarter", "backlog", "wontfix"] as const) {
      const items = state.roadmap.filter((r) => r.bucket === bucket);
      if (items.length === 0) continue;
      const bmeta = ROADMAP_BUCKET_META[bucket];
      lines.push(`### ${bmeta.emoji} ${bmeta.label} (${bmeta.window})`);
      lines.push("");
      lines.push("| Statut | Sévérité | Titre | Source | Effort | Owner |");
      lines.push("|---|---|---|---|---|---|");
      for (const r of items) {
        const smeta = FINDING_SEVERITY_META[r.severity];
        const statusEmoji =
          r.status === "done" ? "✅" : r.status === "doing" ? "🏃" : "📋";
        lines.push(
          `| ${statusEmoji} ${r.status} | ${smeta.emoji} ${smeta.label} | ${r.title} | ${r.source || "–"} | ${r.effort} | ${r.owner || "–"} |`
        );
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour générer un plan de remediation UX, un questionnaire SUS, ou un pitch PMF.*"
  );
  return lines.join("\n");
}
