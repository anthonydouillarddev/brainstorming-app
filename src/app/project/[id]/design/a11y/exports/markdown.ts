import type { Project } from "@/lib/types";
import type { A11yState } from "../state";
import {
  ARIA_WIDGET_META,
  AT_META,
  BROWSER_META,
  CHECK_STATUS_META,
  COGNITIVE_AXIS_META,
  LANDMARK_META,
  MOTION_AXIS_META,
  POLITENESS_META,
  REMEDIATION_BUCKET_META,
  SEVERITY_META,
  WCAG_PRINCIPLE_META,
} from "../state";

export function exportA11yMd(state: A11yState, project: Project): string {
  const lines: string[] = [];
  lines.push(`# Accessibilité — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 10 Accessibilité (WCAG 2.2 AA)");
  lines.push("");

  // WCAG Checklist
  if (state.wcagChecks.length > 0) {
    lines.push("## ♿ WCAG 2.2 AA Checklist");
    lines.push("");
    const byPrinciple: Record<string, typeof state.wcagChecks> = {
      perceivable: [],
      operable: [],
      understandable: [],
      robust: [],
    };
    for (const c of state.wcagChecks) byPrinciple[c.principle].push(c);
    for (const [principle, items] of Object.entries(byPrinciple)) {
      if (items.length === 0) continue;
      const pmeta = WCAG_PRINCIPLE_META[principle as keyof typeof WCAG_PRINCIPLE_META];
      lines.push(`### ${pmeta.emoji} ${pmeta.label}`);
      lines.push("");
      lines.push("| Critère | Level | Titre | Statut | Note |");
      lines.push("|---|---|---|---|---|");
      for (const c of items) {
        const smeta = CHECK_STATUS_META[c.status];
        lines.push(
          `| ${c.criterionId} | ${c.level} | ${c.title} | ${smeta.emoji} ${smeta.label} | ${c.note || "–"} |`
        );
      }
      lines.push("");
    }
  }

  // Keyboard flows
  if (state.keyboardFlows.length > 0) {
    lines.push("## ⌨️ Navigation clavier");
    lines.push("");
    for (const flow of state.keyboardFlows) {
      lines.push(`### ${flow.flowName || "(sans nom)"}`);
      lines.push("");
      if (flow.trapFocus) lines.push(`- 🔒 **Trap focus** : oui`);
      if (flow.escapeHandler) lines.push(`- **Esc handler** : ${flow.escapeHandler}`);
      if (flow.skipLinks) lines.push(`- **Skip links** : ${flow.skipLinks}`);
      lines.push("");
      if (flow.tabOrder.length > 0) {
        lines.push("**Tab order** :");
        lines.push("");
        for (const step of flow.tabOrder) {
          lines.push(
            `${step.index}. ${step.target} ${step.expectedFocus ? "👁️ focus visible" : "⚠️ focus manquant"}`
          );
        }
        lines.push("");
      }
      if (flow.notes) lines.push(`> ${flow.notes}\n`);
    }
  }

  // Landmarks
  if (state.landmarks.length > 0) {
    lines.push("## 🧭 Landmarks");
    lines.push("");
    lines.push("| Landmark | Tag | Présent | Label |");
    lines.push("|---|---|---|---|");
    for (const l of state.landmarks) {
      const meta = LANDMARK_META[l.landmark];
      lines.push(
        `| ${meta.label} | \`${meta.tag}\` | ${l.present ? "✓" : "✗"} | ${l.label || "–"} |`
      );
    }
    lines.push("");
  }

  // Live regions
  if (state.liveRegions.length > 0) {
    lines.push("## 📢 Live regions");
    lines.push("");
    lines.push("| Contexte | Politeness | Atomic |");
    lines.push("|---|---|---|");
    for (const r of state.liveRegions) {
      lines.push(
        `| ${r.context} | ${POLITENESS_META[r.politeness].label} | ${r.atomic ? "✓" : "–"} |`
      );
    }
    lines.push("");
  }

  // ARIA patterns
  if (state.ariaPatterns.length > 0) {
    lines.push("## 🔧 Patterns ARIA");
    lines.push("");
    for (const p of state.ariaPatterns) {
      const meta = ARIA_WIDGET_META[p.widget];
      lines.push(`### ${meta.label}`);
      lines.push("");
      if (p.usage) lines.push(`- **Usage** : ${p.usage}`);
      if (p.keyboardInteractions)
        lines.push(`- **Clavier** : ${p.keyboardInteractions}`);
      lines.push(`- **APG keys** : ${meta.keys}`);
      if (p.notes) lines.push(`- **Notes** : ${p.notes}`);
      lines.push("");
    }
  }

  // Issues
  if (state.issues.length > 0) {
    lines.push("## 📋 Issue log");
    lines.push("");
    lines.push("| WCAG | Sévérité | Statut | Composant | Description | Owner | Trouvé le |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const i of state.issues) {
      const smeta = SEVERITY_META[i.severity];
      lines.push(
        `| ${i.wcagRef || "–"} | ${smeta.emoji} ${smeta.label} | ${i.status} | ${i.component || "–"} | ${i.description} | ${i.owner || "–"} | ${i.foundAt} |`
      );
    }
    lines.push("");
  }

  // Assistive Tech matrix (V2)
  if (state.assistiveTech.length > 0) {
    lines.push("## 🔊 Assistive Tech Matrix");
    lines.push("");
    lines.push("| AT | Browser | Version | Statut | Testé | Notes |");
    lines.push("|---|---|---|---|---|---|");
    for (const a of state.assistiveTech) {
      const smeta = CHECK_STATUS_META[a.status];
      lines.push(
        `| ${AT_META[a.at].label} | ${BROWSER_META[a.browser].label} | ${a.version || "–"} | ${smeta.emoji} ${smeta.label} | ${a.tested ? "✓" : "–"} | ${a.notes || "–"} |`
      );
    }
    lines.push("");
  }

  // Cognitive a11y (V2)
  if (state.cognitiveChecks.length > 0) {
    lines.push("## 🧠 Cognitive accessibility");
    lines.push("");
    lines.push("| Axe | Règle | Statut | Note |");
    lines.push("|---|---|---|---|");
    for (const c of state.cognitiveChecks) {
      const ameta = COGNITIVE_AXIS_META[c.axis];
      const smeta = CHECK_STATUS_META[c.status];
      lines.push(
        `| ${ameta.emoji} ${ameta.label} | ${c.rule} | ${smeta.emoji} ${smeta.label} | ${c.note || "–"} |`
      );
    }
    lines.push("");
  }

  // Motion & Sensory (V2)
  if (state.motionPreferences.length > 0) {
    lines.push("## 🎬 Motion & Sensory");
    lines.push("");
    for (const m of state.motionPreferences) {
      const meta = MOTION_AXIS_META[m.axis];
      lines.push(`### ${meta.emoji} ${meta.label} ${m.respected ? "✓" : "⚠️"}`);
      lines.push("");
      lines.push(`- **Règle** : ${meta.hint}`);
      if (meta.css !== "—") lines.push(`- **Media query** : \`${meta.css}\``);
      if (m.implementation) {
        lines.push(`- **Implémentation** :`);
        lines.push("```css");
        lines.push(m.implementation);
        lines.push("```");
      }
      if (m.notes) lines.push(`- **Notes** : ${m.notes}`);
      lines.push("");
    }
  }

  // Remediation roadmap (V3)
  if (state.remediation.length > 0) {
    lines.push("## 🗺️ Remediation roadmap");
    lines.push("");
    for (const bucket of ["now", "week", "month", "quarter", "wontfix"] as const) {
      const items = state.remediation.filter((r) => r.bucket === bucket);
      if (items.length === 0) continue;
      const bmeta = REMEDIATION_BUCKET_META[bucket];
      lines.push(`### ${bmeta.emoji} ${bmeta.label} (${bmeta.window})`);
      lines.push("");
      lines.push("| Statut | Sévérité | Titre | Référence | Effort | Owner |");
      lines.push("|---|---|---|---|---|---|");
      for (const r of items) {
        const smeta = SEVERITY_META[r.severity];
        const statusEmoji =
          r.status === "done" ? "✅" : r.status === "doing" ? "🏃" : "📋";
        lines.push(
          `| ${statusEmoji} ${r.status} | ${smeta.emoji} ${smeta.label} | ${r.title} | ${r.reference || "–"} | ${r.effort} | ${r.owner || "–"} |`
        );
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour générer un plan de remediation, un rapport VPAT, ou du code d'accessibilité.*"
  );
  return lines.join("\n");
}
