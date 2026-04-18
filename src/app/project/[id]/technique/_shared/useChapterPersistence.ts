"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Hook générique pour persistence d'un chapitre Technique.
// Gère : parse initial + merge-safe + debounced save 800ms + lastSaved + onSectionsChange.
// Robuste : guards unmount + remontée erreur réseau via saveError.

export function useChapterPersistence<T extends object>({
  projectId,
  sectionKey,
  initialContent,
  initialSections,
  onSectionsChange,
  parse,
  merge,
}: {
  projectId: string;
  sectionKey: string;
  initialContent: string | undefined;
  initialSections: Record<string, string>;
  onSectionsChange?: (sections: Record<string, string>) => void;
  parse: (content: string | undefined | null) => T;
  merge: (partial: Partial<T>) => T;
}) {
  const supabase = createClient();
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [state, setState] = useState<T>(() => parse(initialContent));

  function updateState(patch: Partial<T>) {
    setState((prev) => {
      const next = merge({ ...prev, ...patch } as Partial<T>);
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: T) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      setSaving(true);
      setSaveError(null);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: projectId, section_key: sectionKey, content },
          { onConflict: "project_id,section_key" }
        );
      if (!mountedRef.current) return;
      setSaving(false);
      if (error) {
        console.error(`[useChapterPersistence] save failed for ${sectionKey}:`, error);
        setSaveError(error.message || "Erreur de sauvegarde");
        return;
      }
      setLastSaved(
        new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      );
      onSectionsChange?.({ ...initialSections, [sectionKey]: content });
    }, 800);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Lire la ref au moment du cleanup, pas au mount
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { state, updateState, saving, lastSaved, saveError };
}
