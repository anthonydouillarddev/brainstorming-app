"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Hook générique pour persistence d'un chapitre Technique.
// Gère : parse initial + merge-safe + debounced save 800ms + lastSaved + onSectionsChange.

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
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
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
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: projectId, section_key: sectionKey, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({ ...initialSections, [sectionKey]: content });
      }
    }, 800);
  }

  useEffect(() => {
    const timer = saveTimer.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { state, updateState, saving, lastSaved };
}
