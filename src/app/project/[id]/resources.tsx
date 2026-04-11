"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { Project } from "@/lib/types";
import { SECTIONS, parseSections, type SectionData } from "@/lib/sections";
import { FieldRenderer } from "./field-renderer";

export default function SingleSectionPanel({
  project,
  sectionKey,
  initialSections,
  onProjectUpdate,
  onSectionsChange,
}: {
  project: Project;
  sectionKey: string;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const parsedInitial = useMemo(() => parseSections(initialSections), [initialSections]);
  const [sections, setSections] = useState<Record<string, SectionData>>(parsedInitial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const supabase = createClient();

  const def = useMemo(() => SECTIONS.find((s) => s.key === sectionKey) ?? null, [sectionKey]);

  const saveSection = useCallback(
    async (key: string, data: SectionData) => {
      await supabase.from("sections").upsert(
        { project_id: project.id, section_key: key, content: JSON.stringify(data) },
        { onConflict: "project_id,section_key" }
      );
    },
    [project.id, supabase]
  );

  function updateField(key: string, fieldKey: string, value: unknown) {
    setSections((prev) => {
      const updated = {
        ...prev,
        [key]: { ...(prev[key] || {}), [fieldKey]: value },
      };
      if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
      saveTimers.current[key] = setTimeout(async () => {
        setSaving(true);
        await saveSection(key, updated[key]);
        await onProjectUpdate({ updated_at: new Date().toISOString() });
        onSectionsChange?.(
          Object.fromEntries(
            Object.entries(updated).map(([k, v]) => [k, JSON.stringify(v)])
          )
        );
        setSaving(false);
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
      }, 800);
      return updated;
    });
  }

  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      for (const id of Object.values(timers)) clearTimeout(id);
    };
  }, []);

  if (!def) {
    return (
      <p className="text-sm text-muted text-center py-8">Section introuvable : {sectionKey}</p>
    );
  }

  const data = sections[def.key] ?? {};

  return (
    <div className="space-y-5">
      {/* Save indicator */}
      <div className="flex items-center justify-end gap-3 text-xs">
        {saving && <span className="text-muted">Sauvegarde...</span>}
        {lastSaved && !saving && <span className="text-green-500">✓ {lastSaved}</span>}
      </div>

      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{def.emoji}</span>
            <h2 className="font-bold text-lg">{def.title}</h2>
          </div>
          <p className="text-xs text-muted ml-9">{def.description}</p>
        </div>
        <div className="space-y-5">
          {def.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={data[field.key]}
              onChange={(val) => updateField(def.key, field.key, val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
