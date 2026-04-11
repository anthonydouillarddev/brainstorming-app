import type { Todo } from "./types";

export function iceScore(todo: Todo): number | null {
  if (todo.score_method !== "ice") return null;
  const { ice_impact, ice_confidence, ice_ease } = todo;
  if (ice_impact == null || ice_confidence == null || ice_ease == null) return null;
  return ice_impact * ice_confidence * ice_ease;
}

export function todoScore(todo: Todo): number | null {
  if (todo.score_method === "ice") return iceScore(todo);
  return null;
}

export const ICE_HINTS: Record<"impact" | "confidence" | "ease", { title: string; hint: string }> = {
  impact: {
    title: "Impact",
    hint: "À quel point ça va faire avancer ton projet ?  1 = négligeable · 5 = moyen · 10 = transformationnel",
  },
  confidence: {
    title: "Confiance",
    hint: "À quel point tu es sûr que ça va marcher ?  1 = pari risqué · 5 = possible · 10 = certitude",
  },
  ease: {
    title: "Facilité",
    hint: "À quel point c'est simple/rapide à réaliser ?  1 = très long/dur · 5 = moyen · 10 = trivial",
  },
};
