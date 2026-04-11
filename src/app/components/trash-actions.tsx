"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrashActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function restore() {
    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: null })
      .eq("id", projectId);
    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  async function hardDelete() {
    const typed = window.prompt(
      `⚠️ Suppression définitive.\n\nRetape exactement le nom du projet pour confirmer :\n\n${projectName}`
    );
    if (typed == null) return;
    if (typed.trim() !== projectName) {
      alert("Le nom ne correspond pas. Suppression annulée.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          restore();
        }}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/40 text-accent font-semibold hover:bg-accent/25 transition-colors disabled:opacity-50"
      >
        ♻️ Restaurer
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          hardDelete();
        }}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 font-semibold hover:bg-red-500/25 transition-colors disabled:opacity-50"
      >
        🔥 Supprimer
      </button>
    </div>
  );
}
