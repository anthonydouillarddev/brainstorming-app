"use client";

import { createClient } from "@/lib/supabase/client";
import { useMemo, useRef, useState } from "react";
import type { RoadmapItem, Quarter } from "@/lib/types";
import { QUARTERS } from "@/lib/types";

const currentYear = new Date().getFullYear();

export default function RoadmapPanel({
  projectId,
  roadmap,
  onChange,
}: {
  projectId: string;
  roadmap: RoadmapItem[];
  onChange: (items: RoadmapItem[]) => void;
}) {
  const [year, setYear] = useState<number>(currentYear);
  const [addingQuarter, setAddingQuarter] = useState<Quarter | null>(null);
  const [newObjective, setNewObjective] = useState("");
  const submittingRef = useRef(false);
  const supabase = createClient();

  const byQuarter = useMemo(() => {
    const map: Record<Quarter, RoadmapItem[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
    for (const item of roadmap) {
      if (item.year === year) map[item.quarter].push(item);
    }
    for (const q of QUARTERS) {
      map[q].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [roadmap, year]);

  async function handleAdd(quarter: Quarter) {
    if (submittingRef.current) return;
    const objective = newObjective.trim();
    if (!objective) {
      setAddingQuarter(null);
      return;
    }
    submittingRef.current = true;
    const existingPositions = byQuarter[quarter].map((i) => i.position);
    const nextPosition =
      existingPositions.length === 0 ? 0 : Math.max(...existingPositions) + 1;
    const { data, error } = await supabase
      .from("roadmap_items")
      .insert({
        project_id: projectId,
        quarter,
        year,
        objective,
        position: nextPosition,
      })
      .select()
      .single();
    submittingRef.current = false;
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (data) {
      onChange([...roadmap, data as RoadmapItem]);
      setNewObjective("");
      setAddingQuarter(null);
    }
  }

  async function toggleAchieved(item: RoadmapItem) {
    const nextValue = !item.achieved;
    onChange(roadmap.map((r) => (r.id === item.id ? { ...r, achieved: nextValue } : r)));
    const { error } = await supabase
      .from("roadmap_items")
      .update({ achieved: nextValue })
      .eq("id", item.id);
    if (error) {
      onChange(roadmap.map((r) => (r.id === item.id ? { ...r, achieved: item.achieved } : r)));
      alert("Erreur : " + error.message);
    }
  }

  async function handleDelete(id: string) {
    const previous = roadmap;
    onChange(previous.filter((r) => r.id !== id));
    const { error } = await supabase.from("roadmap_items").delete().eq("id", id);
    if (error) {
      onChange(previous);
      alert("Erreur : " + error.message);
    }
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          🗺️ Roadmap {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear(year - 1)}
            className="w-6 h-6 rounded-lg bg-background/60 border border-border text-muted hover:text-foreground text-xs transition-colors"
            aria-label="Année précédente"
          >
            ◂
          </button>
          <span className="text-xs font-semibold px-2">{year}</span>
          <button
            onClick={() => setYear(year + 1)}
            className="w-6 h-6 rounded-lg bg-background/60 border border-border text-muted hover:text-foreground text-xs transition-colors"
            aria-label="Année suivante"
          >
            ▸
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUARTERS.map((q) => {
          const items = byQuarter[q];
          const done = items.filter((i) => i.achieved).length;
          const isAdding = addingQuarter === q;
          return (
            <div
              key={q}
              className="bg-background/60 border border-border rounded-xl p-3 flex flex-col min-h-[140px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">{q}</span>
                {items.length > 0 && (
                  <span className="text-[10px] text-muted">
                    {done}/{items.length}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                {items.length === 0 && !isAdding && (
                  <p className="text-[11px] text-muted/60 italic">Aucun objectif</p>
                )}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 text-xs group"
                  >
                    <button
                      onClick={() => toggleAchieved(item)}
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 transition-colors ${
                        item.achieved
                          ? "bg-green-500 border-green-500"
                          : "border-border hover:border-accent"
                      }`}
                      aria-label="Marquer atteint"
                    >
                      {item.achieved && (
                        <span className="text-white text-[9px] flex items-center justify-center leading-none">
                          ✓
                        </span>
                      )}
                    </button>
                    <span
                      className={`flex-1 leading-snug ${
                        item.achieved ? "line-through text-muted" : ""
                      }`}
                    >
                      {item.objective}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {isAdding && (
                  <input
                    autoFocus
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onBlur={() => {
                      if (newObjective.trim()) handleAdd(q);
                      else setAddingQuarter(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd(q);
                      if (e.key === "Escape") {
                        setNewObjective("");
                        setAddingQuarter(null);
                      }
                    }}
                    placeholder="Nouvel objectif..."
                    className="w-full px-2 py-1 bg-card border border-accent/40 rounded text-xs outline-none"
                  />
                )}
              </div>

              {!isAdding && (
                <button
                  onClick={() => setAddingQuarter(q)}
                  className="text-[10px] text-muted hover:text-accent mt-2 text-left transition-colors"
                >
                  + Ajouter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
