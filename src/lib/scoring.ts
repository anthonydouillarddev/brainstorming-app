import type { Todo } from "./types";

export function riceScore(todo: Todo): number | null {
  if (todo.score_method !== "rice") return null;
  const { rice_reach, rice_impact, rice_confidence, rice_effort } = todo;
  if (
    rice_reach == null ||
    rice_impact == null ||
    rice_confidence == null ||
    rice_effort == null ||
    rice_effort <= 0
  ) {
    return null;
  }
  return Math.round(((rice_reach * rice_impact * (rice_confidence / 100)) / rice_effort) * 10) / 10;
}

export function iceScore(todo: Todo): number | null {
  if (todo.score_method !== "ice") return null;
  const { ice_impact, ice_confidence, ice_ease } = todo;
  if (ice_impact == null || ice_confidence == null || ice_ease == null) return null;
  return ice_impact * ice_confidence * ice_ease;
}

export function todoScore(todo: Todo): number | null {
  if (todo.score_method === "rice") return riceScore(todo);
  if (todo.score_method === "ice") return iceScore(todo);
  return null;
}

export const RICE_IMPACT_OPTIONS = [
  { value: 0.25, label: "Minimal" },
  { value: 0.5, label: "Faible" },
  { value: 1, label: "Moyen" },
  { value: 2, label: "Fort" },
  { value: 3, label: "Massif" },
];

export const RICE_CONFIDENCE_OPTIONS = [
  { value: 50, label: "50 %" },
  { value: 80, label: "80 %" },
  { value: 100, label: "100 %" },
];
