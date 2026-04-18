import type { Project } from "@/lib/types";
import type { A11yState } from "../state";
import {
  ARIA_WIDGET_META,
  AT_META,
  BROWSER_META,
  COGNITIVE_AXIS_META,
  LANDMARK_META,
  MOTION_AXIS_META,
  POLITENESS_META,
  SEVERITY_META,
} from "../state";

export function exportA11yClaudeBrief(state: A11yState, project: Project): string {
  const lines: string[] = [];

  lines.push(`# Brief accessibilité — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas implémenter / auditer l'accessibilité. Respecte STRICTEMENT WCAG 2.2 AA, les patterns ARIA"
  );
  lines.push(
    "Authoring Practices Guide (APG), et les interactions clavier définies. Pas de fallback non testé AT."
  );
  lines.push("");

  const failedA = state.wcagChecks.filter(
    (c) => c.level === "A" && c.status === "fail"
  );
  if (failedA.length > 0) {
    lines.push("## 🔴 Level A en échec (NON conforme légalement)");
    lines.push("");
    for (const c of failedA) {
      lines.push(`- **${c.criterionId} — ${c.title}**${c.note ? ` · ${c.note}` : ""}`);
    }
    lines.push("");
  }

  const failedAA = state.wcagChecks.filter(
    (c) => c.level === "AA" && c.status === "fail"
  );
  if (failedAA.length > 0) {
    lines.push("## 🟠 Level AA en échec");
    lines.push("");
    for (const c of failedAA) {
      lines.push(`- **${c.criterionId} — ${c.title}**${c.note ? ` · ${c.note}` : ""}`);
    }
    lines.push("");
  }

  if (state.keyboardFlows.length > 0) {
    lines.push("## Flows clavier à respecter");
    lines.push("");
    for (const flow of state.keyboardFlows) {
      lines.push(`### ${flow.flowName}`);
      if (flow.trapFocus) lines.push(`- Trap focus : oui (Esc → ${flow.escapeHandler})`);
      if (flow.skipLinks) lines.push(`- Skip link : ${flow.skipLinks}`);
      for (const step of flow.tabOrder) {
        lines.push(
          `  ${step.index}. ${step.target}${step.expectedFocus ? " · focus visible" : ""}`
        );
      }
      lines.push("");
    }
  }

  if (state.landmarks.length > 0) {
    lines.push("## Landmarks structure");
    lines.push("");
    for (const l of state.landmarks) {
      const meta = LANDMARK_META[l.landmark];
      lines.push(
        `- ${meta.label} (\`${meta.tag}\`) ${l.present ? "✓ présent" : "✗ manquant"}${l.label ? ` · aria-label="${l.label}"` : ""}`
      );
    }
    lines.push("");
  }

  if (state.liveRegions.length > 0) {
    lines.push("## Live regions (annonces dynamiques)");
    lines.push("");
    for (const r of state.liveRegions) {
      lines.push(
        `- **${r.context}** · ${POLITENESS_META[r.politeness].label}${r.atomic ? " · atomic=true" : ""}`
      );
    }
    lines.push("");
  }

  if (state.ariaPatterns.length > 0) {
    lines.push("## Patterns ARIA (APG)");
    lines.push("");
    for (const p of state.ariaPatterns) {
      const meta = ARIA_WIDGET_META[p.widget];
      lines.push(`### ${meta.label} — ${p.usage}`);
      lines.push(`- Clavier attendu : ${p.keyboardInteractions || meta.keys}`);
      if (p.notes) lines.push(`- Notes : ${p.notes}`);
      lines.push("");
    }
  }

  const openCritical = state.issues.filter(
    (i) => i.status === "open" && i.severity === "critical"
  );
  if (openCritical.length > 0) {
    lines.push("## 🔴 Issues critiques ouvertes");
    lines.push("");
    for (const i of openCritical) {
      const smeta = SEVERITY_META[i.severity];
      lines.push(
        `- **${i.component || "?"}** · ${smeta.emoji} ${i.description}${i.wcagRef ? ` · WCAG ${i.wcagRef}` : ""}`
      );
    }
    lines.push("");
  }

  if (state.assistiveTech.length > 0) {
    lines.push("## Assistive Tech compatibility (combos testés)");
    lines.push("");
    for (const a of state.assistiveTech) {
      lines.push(
        `- **${AT_META[a.at].label} × ${BROWSER_META[a.browser].label}** ${a.version ? `(${a.version})` : ""}${a.tested ? " · testé" : " · non testé"}${a.notes ? ` · ${a.notes}` : ""}`
      );
    }
    lines.push("");
  }

  if (state.cognitiveChecks.length > 0) {
    lines.push("## Cognitive accessibility (règles à respecter)");
    lines.push("");
    for (const c of state.cognitiveChecks) {
      if (c.status !== "fail") {
        lines.push(
          `- [${COGNITIVE_AXIS_META[c.axis].label}] ${c.rule}${c.note ? ` · ${c.note}` : ""}`
        );
      }
    }
    lines.push("");
  }

  if (state.motionPreferences.length > 0) {
    lines.push("## Motion & sensory (media queries à implémenter)");
    lines.push("");
    for (const m of state.motionPreferences) {
      lines.push(
        `- **${MOTION_AXIS_META[m.axis].label}** ${m.respected ? "✓" : "⚠️ TODO"} · ${m.implementation || MOTION_AXIS_META[m.axis].hint}`
      );
    }
    lines.push("");
  }

  if (state.remediation.length > 0) {
    const open = state.remediation.filter((r) => r.status !== "done");
    if (open.length > 0) {
      lines.push("## Remediation roadmap (plan d'action a11y)");
      lines.push("");
      for (const bucket of ["now", "week", "month", "quarter"] as const) {
        const items = open.filter((r) => r.bucket === bucket);
        if (items.length === 0) continue;
        lines.push(`### ${bucket}`);
        for (const r of items) {
          lines.push(
            `- ${SEVERITY_META[r.severity].emoji} **${r.title}** · ${r.reference || "–"}${r.effort ? ` · effort ${r.effort}` : ""}`
          );
        }
        lines.push("");
      }
    }
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère le code React du modal accessible »,"
  );
  lines.push(
    "« Fournis un plan de remediation priorisé », « Écris les tests a11y avec @testing-library », etc.)*"
  );

  return lines.join("\n");
}
