"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import type { SectionDef } from "@/lib/sections";

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function ProjectEditor({
  project,
  initialSections,
  sectionDefs,
}: {
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [status, setStatus] = useState(project.status);
  const [name, setName] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  const saveSection = useCallback(
    async (key: string, content: string) => {
      await supabase.from("sections").upsert(
        { project_id: project.id, section_key: key, content },
        { onConflict: "project_id,section_key" }
      );
    },
    [project.id, supabase]
  );

  function handleSectionChange(key: string, value: string) {
    setSections((prev) => ({ ...prev, [key]: value }));

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await saveSection(key, value);
      await supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", project.id);
      setSaving(false);
      setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    }, 800);
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    await supabase.from("projects").update({ status: newStatus }).eq("id", project.id);
  }

  async function handleNameChange() {
    if (name.trim() && name !== project.name) {
      await supabase.from("projects").update({ name: name.trim() }).eq("id", project.id);
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${project.name}" et tout son contenu ?`)) return;
    setDeleting(true);
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/");
  }

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  const statuses = [
    { value: "idea", label: "💭 Idée", bg: "bg-gray-700" },
    { value: "validating", label: "🔍 Validation", bg: "bg-yellow-700" },
    { value: "building", label: "🛠️ En dev", bg: "bg-blue-700" },
    { value: "launched", label: "🚀 Lancé", bg: "bg-green-700" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-3 text-xs">
          {saving && <span className="text-muted">Sauvegarde...</span>}
          {lastSaved && !saving && (
            <span className="text-green-500">✓ {lastSaved}</span>
          )}
        </div>
      </div>

      {/* Project name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleNameChange}
        className="text-2xl font-bold bg-transparent border-none outline-none w-full mb-3 focus:ring-0"
      />

      {/* Status selector */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              status === s.value
                ? `${s.bg} text-white`
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sectionDefs.map((def) => (
          <div
            key={def.key}
            className={`bg-card border-l-4 ${def.color} border border-border rounded-xl overflow-hidden`}
          >
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-sm">
                {def.emoji} {def.title}
              </h2>
            </div>
            <textarea
              value={sections[def.key] || ""}
              onChange={(e) => handleSectionChange(def.key, e.target.value)}
              placeholder={def.placeholder}
              className="w-full px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none resize-y min-h-[80px]"
            />
          </div>
        ))}
      </div>

      {/* Delete */}
      <div className="mt-12 pt-6 border-t border-border">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 text-sm hover:text-red-400 transition-colors"
        >
          {deleting ? "Suppression..." : "🗑️ Supprimer ce projet"}
        </button>
      </div>
    </div>
  );
}
