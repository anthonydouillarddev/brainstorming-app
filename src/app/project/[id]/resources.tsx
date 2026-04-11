"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { Project } from "@/lib/types";
import { getResourcesSections } from "@/lib/sections";
import { FieldRenderer } from "./field-renderer";

type SectionData = Record<string, unknown>;

function parseInitial(initial: Record<string, string>): Record<string, SectionData> {
  const out: Record<string, SectionData> = {};
  for (const [key, raw] of Object.entries(initial)) {
    try {
      out[key] = JSON.parse(raw);
    } catch {
      out[key] = {};
    }
  }
  return out;
}

export default function ResourcesPanel({
  project,
  initialSections,
  onProjectUpdate,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const parsedInitial = useMemo(() => parseInitial(initialSections), [initialSections]);
  const [sections, setSections] = useState<Record<string, SectionData>>(parsedInitial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tech" | "resources">("tech");
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const supabase = createClient();

  const resourcesSections = useMemo(() => getResourcesSections(), []);

  const saveSection = useCallback(
    async (sectionKey: string, data: SectionData) => {
      await supabase.from("sections").upsert(
        { project_id: project.id, section_key: sectionKey, content: JSON.stringify(data) },
        { onConflict: "project_id,section_key" }
      );
    },
    [project.id, supabase]
  );

  function updateField(sectionKey: string, fieldKey: string, value: unknown) {
    setSections((prev) => {
      const updated = {
        ...prev,
        [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value },
      };
      if (saveTimers.current[sectionKey]) clearTimeout(saveTimers.current[sectionKey]);
      saveTimers.current[sectionKey] = setTimeout(async () => {
        setSaving(true);
        await saveSection(sectionKey, updated[sectionKey]);
        await onProjectUpdate({ updated_at: new Date().toISOString() });
        onSectionsChange?.({
          ...initialSections,
          ...Object.fromEntries(
            Object.entries(updated).map(([k, v]) => [k, JSON.stringify(v)])
          ),
        });
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

  const currentSection = resourcesSections.find((s) => s.key === activeTab);
  const currentData = currentSection ? sections[currentSection.key] ?? {} : {};

  return (
    <div className="space-y-5">
      {/* Save indicator */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-1 shadow-sm">
          {resourcesSections.map((def) => (
            <button
              key={def.key}
              onClick={() => setActiveTab(def.key as "tech" | "resources")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all inline-flex items-center gap-1.5 ${
                activeTab === def.key
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span>{def.emoji}</span>
              <span>{def.title}</span>
            </button>
          ))}
        </div>
        <div className="text-xs">
          {saving && <span className="text-muted">Sauvegarde...</span>}
          {lastSaved && !saving && <span className="text-green-500">✓ {lastSaved}</span>}
        </div>
      </div>

      {/* Section content */}
      {currentSection && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentSection.emoji}</span>
              <h2 className="font-bold text-lg">{currentSection.title}</h2>
            </div>
            <p className="text-xs text-muted ml-9">{currentSection.description}</p>
          </div>
          <div className="space-y-5">
            {currentSection.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={currentData[field.key]}
                onChange={(val) => updateField(currentSection.key, field.key, val)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
