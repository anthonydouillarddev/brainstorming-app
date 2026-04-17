import type { Project } from "@/lib/types";
import type { PrinciplesState } from "../state";
import { computeNielsenScore } from "../state";
import { NIELSEN_HEURISTICS } from "../nielsen";
import { UX_LAWS } from "../laws-library";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
}

export function exportPrinciplesMd(state: PrinciplesState, project: Project): string {
  const lines: string[] = [];
  lines.push(`# Principes d'interaction — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 5 Principes d'interaction & lois UX");
  lines.push("");

  // Design Principles Card (le plus important en premier)
  const principlesFilled = state.designPrinciples.filter((p) => p.trim());
  if (principlesFilled.length > 0) {
    lines.push("## 📜 Design Principles Card");
    lines.push("");
    principlesFilled.forEach((p, i) => {
      lines.push(`${i + 1}. **${p.trim()}**`);
    });
    lines.push("");
  }

  // Nielsen score
  const score = computeNielsenScore(state);
  if (score.answered > 0) {
    lines.push("## 🧪 Audit Nielsen");
    lines.push("");
    lines.push(`**Score : ${score.passed}/${score.total}** (${score.answered} répondues)`);
    lines.push("");
    lines.push("| # | Heuristique | Réponse | Note |");
    lines.push("|---|---|---|---|");
    for (const h of NIELSEN_HEURISTICS) {
      const entry = state.nielsenAnswers.find((e) => e.heuristicSlug === h.slug);
      const answer =
        entry?.answer === "yes"
          ? "✓"
          : entry?.answer === "no"
          ? "✗"
          : entry?.answer === "unknown"
          ? "?"
          : "—";
      lines.push(
        `| ${h.num} | ${stripHtml(h.title)} | ${answer} | ${entry?.note ?? ""} |`
      );
    }
    lines.push("");
  }

  // Lois épinglées
  if (state.pinnedLaws.length > 0) {
    lines.push("## 📚 Lois UX épinglées");
    lines.push("");
    for (const pin of state.pinnedLaws) {
      const law = UX_LAWS.find((l) => l.slug === pin.lawSlug);
      if (!law) continue;
      lines.push(`### ${stripHtml(law.name)} [${pin.priority.toUpperCase()}]`);
      lines.push(law.summary);
      if (pin.rationale) lines.push(`*Pourquoi pour ce projet : ${pin.rationale}*`);
      lines.push(`✓ ${law.exampleGood}`);
      lines.push(`✗ ${law.exampleBad}`);
      lines.push("");
    }
  }

  // Affordances
  if (state.affordances.length > 0) {
    lines.push("## 👆 Affordances & signifiers");
    lines.push("");
    lines.push("| Composant | Hover | Focus | Pressed | Disabled | aria-label |");
    lines.push("|---|---|---|---|---|---|");
    for (const a of state.affordances) {
      lines.push(
        `| ${a.component || "(sans nom)"} | ${a.hover ? "✓" : "✗"} | ${a.focus ? "✓" : "✗"} | ${a.pressed ? "✓" : "✗"} | ${a.disabled ? "✓" : "✗"} | ${a.accessibleLabel ? "✓" : "✗"} |`
      );
    }
    lines.push("");
  }

  // Feedback inventory
  if (state.feedbackInventory.length > 0) {
    lines.push("## 📣 Feedback inventory");
    lines.push("");
    lines.push("| Action | Visuel | Haptic | Audio | Latence |");
    lines.push("|---|---|---|---|---|");
    for (const f of state.feedbackInventory) {
      lines.push(
        `| ${f.action || "(sans nom)"} | ${f.visual ? "✓" : "✗"} | ${f.haptic ? "✓" : "✗"} | ${f.audio ? "✓" : "✗"} | ${f.latencyMs}ms |`
      );
    }
    lines.push("");
  }

  // Cognitive load (V2)
  if (state.cognitiveLoad.length > 0) {
    lines.push("## 🧠 Cognitive load par écran");
    lines.push("");
    lines.push("| Écran | Intrinsic | Extraneous | Germane | Note |");
    lines.push("|---|---|---|---|---|");
    for (const c of state.cognitiveLoad) {
      lines.push(
        `| ${c.screen} | ${c.intrinsic}/5 | ${c.extraneous}/5 | ${c.germane}/5 | ${c.notes} |`
      );
    }
    lines.push("");
  }

  // Peak-End (V2)
  if (state.peakEndSteps.length > 0) {
    lines.push("## 🎢 Peak-End journey");
    lines.push("");
    lines.push("| Étape | Émotion | Peak | End |");
    lines.push("|---|---|---|---|");
    for (const p of state.peakEndSteps) {
      lines.push(
        `| ${p.name} | ${p.emotion > 0 ? "+" : ""}${p.emotion} | ${p.isPeak ? "⭐" : ""} | ${p.isEnd ? "🏁" : ""} |`
      );
    }
    lines.push("");
  }

  // Mental model (V2)
  const mm = state.mentalModel;
  if (mm.designModel.trim() || mm.systemImage.trim() || mm.userModel.trim()) {
    lines.push("## 🧠 Mental Model Canvas");
    lines.push("");
    lines.push(`**Design model** (ce que tu as en tête) :`);
    lines.push(mm.designModel || "*(non renseigné)*");
    lines.push("");
    lines.push(`**System image** (ce que l'UI montre) :`);
    lines.push(mm.systemImage || "*(non renseigné)*");
    lines.push("");
    lines.push(`**User model** (ce que l'user en déduit) :`);
    lines.push(mm.userModel || "*(non renseigné)*");
    if (mm.gulfs.length > 0) {
      lines.push("");
      lines.push(`**Gulfs identifiés** :`);
      mm.gulfs.forEach((g) => lines.push(`- ${g}`));
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il review tes écrans contre ces principes, ou génère une checklist CI design.*"
  );
  return lines.join("\n");
}
