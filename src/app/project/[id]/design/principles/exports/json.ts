import type { Project } from "@/lib/types";
import type { PrinciplesState } from "../state";
import { computeNielsenScore } from "../state";
import { NIELSEN_HEURISTICS } from "../nielsen";
import { UX_LAWS } from "../laws-library";

export function exportPrinciplesJson(state: PrinciplesState, project: Project): string {
  const score = computeNielsenScore(state);
  const nielsenEnriched = state.nielsenAnswers.map((a) => {
    const h = NIELSEN_HEURISTICS.find((x) => x.slug === a.heuristicSlug);
    return {
      heuristicSlug: a.heuristicSlug,
      num: h?.num,
      title: h?.title.replace(/<[^>]+>/g, ""),
      answer: a.answer,
      note: a.note,
    };
  });
  const pinnedEnriched = state.pinnedLaws.map((p) => {
    const law = UX_LAWS.find((l) => l.slug === p.lawSlug);
    return {
      lawSlug: p.lawSlug,
      name: law?.name.replace(/<[^>]+>/g, ""),
      category: law?.category,
      priority: p.priority,
      rationale: p.rationale,
    };
  });

  return JSON.stringify(
    {
      $description: "Mindeck — Principes d'interaction (chap. 5)",
      $source: "mindeck",
      project: {
        name: project.official_name || project.name,
        type: project.type,
      },
      nielsen: {
        score,
        answers: nielsenEnriched,
      },
      pinnedLaws: pinnedEnriched,
      affordances: state.affordances,
      feedbackInventory: state.feedbackInventory,
      designPrinciples: state.designPrinciples.filter((p) => p.trim()),
      cognitiveLoad: state.cognitiveLoad,
      menus: state.menus,
      peakEndSteps: state.peakEndSteps,
      mentalModel: state.mentalModel,
      screenAudits: state.screenAudits,
      latencyLog: state.latencyLog,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
