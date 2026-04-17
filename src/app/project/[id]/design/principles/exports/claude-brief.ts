import type { Project } from "@/lib/types";
import type { PrinciplesState } from "../state";
import { UX_LAWS } from "../laws-library";
import { NIELSEN_HEURISTICS } from "../nielsen";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
}

export function exportPrinciplesClaudeBrief(
  state: PrinciplesState,
  project: Project
): string {
  const lines: string[] = [];
  const principlesFilled = state.designPrinciples.filter((p) => p.trim());

  lines.push(`# Brief principes — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas review mes écrans et propositions contre ces principes d'interaction. Signale"
  );
  lines.push(
    "explicitement chaque violation avec la loi/heuristique concernée et une correction"
  );
  lines.push("actionnable.");
  lines.push("");

  if (principlesFilled.length > 0) {
    lines.push("## Design Principles non négociables");
    lines.push("");
    principlesFilled.forEach((p, i) => {
      lines.push(`${i + 1}. **${p.trim()}**`);
    });
    lines.push("");
  }

  const failedHeuristics = state.nielsenAnswers.filter((a) => a.answer === "no");
  if (failedHeuristics.length > 0) {
    lines.push("## Heuristiques Nielsen à réparer");
    lines.push("");
    for (const a of failedHeuristics) {
      const h = NIELSEN_HEURISTICS.find((x) => x.slug === a.heuristicSlug);
      if (!h) continue;
      lines.push(`- **H${h.num} ${stripHtml(h.title)}** : ${h.summary}`);
      if (a.note) lines.push(`  - Note : ${a.note}`);
    }
    lines.push("");
  }

  if (state.pinnedLaws.length > 0) {
    lines.push("## Lois UX épinglées");
    lines.push("");
    for (const pin of state.pinnedLaws) {
      const law = UX_LAWS.find((l) => l.slug === pin.lawSlug);
      if (!law) continue;
      lines.push(`- **${stripHtml(law.name)}** [${pin.priority}] — ${law.summary}`);
      if (pin.rationale) lines.push(`  - Contexte : ${pin.rationale}`);
    }
    lines.push("");
  }

  if (state.feedbackInventory.length > 0) {
    lines.push("## Feedback inventory");
    lines.push("");
    for (const f of state.feedbackInventory) {
      const channels = [
        f.visual && "visuel",
        f.haptic && "haptic",
        f.audio && "audio",
      ]
        .filter(Boolean)
        .join(" + ");
      lines.push(
        `- **${f.action}** : ${channels || "⚠ aucun feedback"} (latence ${f.latencyMs}ms)`
      );
    }
    lines.push("");
  }

  if (state.mentalModel.designModel.trim()) {
    lines.push("## Mental model attendu");
    lines.push("");
    lines.push(`**Design model** : ${state.mentalModel.designModel}`);
    lines.push(`**System image** : ${state.mentalModel.systemImage}`);
    lines.push(`**User model** : ${state.mentalModel.userModel}`);
    if (state.mentalModel.gulfs.length > 0) {
      lines.push("");
      lines.push("**Gulfs à combler** :");
      state.mentalModel.gulfs.forEach((g) => lines.push(`- ${g}`));
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Review cet écran contre mes principes »,"
  );
  lines.push(
    "« Génère une checklist Figma lint », « Propose 3 correctifs prioritaires », etc.)*"
  );

  return lines.join("\n");
}
