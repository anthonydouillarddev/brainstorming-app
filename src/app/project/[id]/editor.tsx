"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import type { SectionDef, Field } from "@/lib/sections";
import ThemeToggle from "@/app/components/theme-toggle";

interface Project {
  id: string;
  name: string;
  status: string;
}

interface LinkItem {
  title: string;
  url: string;
  tag: string;
}

type SectionData = Record<string, unknown>;

export default function ProjectEditor({
  project,
  initialSections,
  sectionDefs,
}: {
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
}) {
  // Parse stored JSON content
  const parsedInitial: Record<string, SectionData> = {};
  for (const [key, raw] of Object.entries(initialSections)) {
    try {
      parsedInitial[key] = JSON.parse(raw);
    } catch {
      parsedInitial[key] = {};
    }
  }

  const [sections, setSections] = useState<Record<string, SectionData>>(parsedInitial);
  const [status, setStatus] = useState(project.status);
  const [name, setName] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

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
      const updated = { ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value } };

      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        await saveSection(sectionKey, updated[sectionKey]);
        await supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", project.id);
        setSaving(false);
        setLastSaved(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      }, 800);

      return updated;
    });
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

  function toggleCollapse(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function exportForClaude() {
    const lines: string[] = [];
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    lines.push(`# ${name}`);
    lines.push(`> Exporté le ${date} — Statut : ${status}`);
    lines.push("");

    for (const def of sectionDefs) {
      const data = sections[def.key] || {};
      const hasContent = def.fields.some((f) => {
        const v = data[f.key];
        if (!v) return false;
        if (typeof v === "string") return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "number") return v > 0;
        return false;
      });
      if (!hasContent) continue;

      lines.push(`---`);
      lines.push(`## ${def.emoji} ${def.title}`);
      lines.push("");

      for (const field of def.fields) {
        const val = data[field.key];
        if (!val) continue;

        if (field.type === "question" || field.type === "text") {
          const text = val as string;
          if (!text.trim()) continue;
          lines.push(`### ${field.label}`);
          if (field.hint) lines.push(`_${field.hint}_`);
          lines.push("");
          lines.push(text.trim());
          lines.push("");
        }

        if (field.type === "choice") {
          const selected = val as string[];
          if (selected.length === 0) continue;
          lines.push(`### ${field.label}`);
          for (const s of selected) {
            lines.push(`- [x] ${s}`);
          }
          const unselected = (field.options || []).filter((o) => !selected.includes(o));
          for (const u of unselected) {
            lines.push(`- [ ] ${u}`);
          }
          lines.push("");
        }

        if (field.type === "links") {
          const links = val as LinkItem[];
          if (links.length === 0) continue;
          lines.push(`### ${field.label}`);
          for (const link of links) {
            lines.push(`- [${link.tag}] [${link.title}](${link.url})`);
          }
          lines.push("");
        }

        if (field.type === "score") {
          const score = val as number;
          if (score <= 0) continue;
          lines.push(`- **${field.label}** : ${score}/10`);
        }
      }
      lines.push("");
    }

    // Score total
    if (totalScore > 0) {
      lines.push("---");
      lines.push(`## Score total : ${totalScore}/${maxScore}`);
      lines.push("");
    }

    // Section Claude.md
    lines.push("---");
    lines.push("## Instructions pour Claude");
    lines.push("");
    lines.push("Ce fichier contient le brainstorming complet du projet. Utilise-le pour :");
    lines.push("- Créer le CLAUDE.md du projet avec toutes les conventions et infos");
    lines.push("- Générer la structure de dossiers du projet");
    lines.push("- Créer les fichiers de base (schema Prisma, config auth, etc.)");
    lines.push("- Adapter les choix techniques aux réponses de la section Stack");
    lines.push("- Respecter le business model et les features MVP définies");
    lines.push("- Ne PAS implémenter ce qui est listé dans 'Ce qu'on ne construit PAS en V1'");
    lines.push("");

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brainstorming.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, []);

  const statuses = [
    { value: "idea", label: "💭 Idée", bg: "bg-gray-700" },
    { value: "validating", label: "🔍 Validation", bg: "bg-yellow-700" },
    { value: "building", label: "🛠️ En dev", bg: "bg-blue-700" },
    { value: "launched", label: "🚀 Lancé", bg: "bg-green-700" },
  ];

  // Calculate total score
  const scoreDef = sectionDefs.find((s) => s.key === "score");
  const scoreData = sections["score"] || {};
  const scoreFields = scoreDef?.fields.filter((f) => f.type === "score") || [];
  const totalScore = scoreFields.reduce((sum, f) => sum + (Number(scoreData[f.key]) || 0), 0);
  const maxScore = scoreFields.length * 10;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 py-3 z-10" style={{ background: "var(--color-background)" }}>
        <button onClick={() => router.push("/")} className="text-muted hover:text-foreground text-sm transition-colors">
          ← Retour
        </button>
        <div className="flex items-center gap-3 text-xs">
          {saving && <span className="text-muted">Sauvegarde...</span>}
          {lastSaved && !saving && <span className="text-green-500">✓ {lastSaved}</span>}
          <ThemeToggle />
          {maxScore > 0 && (
            <span className={`font-bold ${totalScore >= maxScore * 0.7 ? "text-green-500" : totalScore >= maxScore * 0.4 ? "text-yellow-500" : "text-red-400"}`}>
              {totalScore}/{maxScore}
            </span>
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

      {/* Status */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${status === s.value ? `${s.bg} text-white` : "bg-card border border-border text-muted hover:text-foreground"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sectionDefs.map((def) => (
          <div key={def.key} className={`bg-card border-l-4 ${def.color} border border-border rounded-xl overflow-hidden`}>
            {/* Section header — clickable to collapse */}
            <button
              onClick={() => toggleCollapse(def.key)}
              className="w-full px-4 py-3 border-b border-border flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h2 className="font-semibold text-sm">{def.emoji} {def.title}</h2>
                <p className="text-xs text-muted mt-0.5">{def.description}</p>
              </div>
              <span className="text-muted text-xs">{collapsed[def.key] ? "▸" : "▾"}</span>
            </button>

            {/* Fields */}
            {!collapsed[def.key] && (
              <div className="px-4 py-3 space-y-4">
                {def.fields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    value={sections[def.key]?.[field.key]}
                    onChange={(val) => updateField(def.key, field.key, val)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export + Delete */}
      <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
        <button onClick={handleDelete} disabled={deleting} className="text-red-500 text-sm hover:text-red-400 transition-colors">
          {deleting ? "Suppression..." : "🗑️ Supprimer ce projet"}
        </button>
        <button
          onClick={exportForClaude}
          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          📥 Exporter pour Claude
        </button>
      </div>
    </div>
  );
}

// ─── FIELD RENDERER ──────────────────────────

function FieldRenderer({ field, value, onChange }: { field: Field; value: unknown; onChange: (val: unknown) => void }) {
  switch (field.type) {
    case "question":
      return <QuestionField field={field} value={(value as string) || ""} onChange={onChange} />;
    case "text":
      return <TextField field={field} value={(value as string) || ""} onChange={onChange} />;
    case "choice":
      return <ChoiceField field={field} value={(value as string[]) || []} onChange={onChange} />;
    case "links":
      return <LinksField field={field} value={(value as LinkItem[]) || []} onChange={onChange} />;
    case "score":
      return <ScoreField field={field} value={(value as number) || 0} onChange={onChange} />;
    default:
      return null;
  }
}

// ─── QUESTION FIELD ──────────────────────────

function QuestionField({ field, value, onChange }: { field: Field; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-1.5">{field.hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent resize-y min-h-[60px]"
      />
    </div>
  );
}

// ─── TEXT FIELD (large) ──────────────────────

function TextField({ field, value, onChange }: { field: Field; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-1.5">{field.hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent resize-y min-h-[120px]"
      />
    </div>
  );
}

// ─── CHOICE FIELD (checkboxes) ───────────────

function ChoiceField({ field, value, onChange }: { field: Field; value: string[]; onChange: (val: string[]) => void }) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-2">{field.hint}</p>}
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              value.includes(option)
                ? "bg-accent/20 border-accent text-accent"
                : "bg-background border-border text-muted hover:text-foreground hover:border-muted"
            }`}
          >
            {value.includes(option) ? "✓ " : ""}{option}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── LINKS FIELD ─────────────────────────────

function LinksField({ field, value, onChange }: { field: Field; value: LinkItem[]; onChange: (val: LinkItem[]) => void }) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Autre");

  const tags = ["TikTok", "YouTube", "Article", "Produit", "Design", "Doc", "Autre"];

  function addLink() {
    if (!newUrl.trim()) return;
    const title = newTitle.trim() || new URL(newUrl.startsWith("http") ? newUrl : `https://${newUrl}`).hostname;
    onChange([...value, { title, url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`, tag: newTag }]);
    setNewUrl("");
    setNewTitle("");
    setNewTag("Autre");
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const tagColors: Record<string, string> = {
    TikTok: "bg-pink-900/40 text-pink-400",
    YouTube: "bg-red-900/40 text-red-400",
    Article: "bg-blue-900/40 text-blue-400",
    Produit: "bg-green-900/40 text-green-400",
    Design: "bg-purple-900/40 text-purple-400",
    Doc: "bg-cyan-900/40 text-cyan-400",
    Autre: "bg-gray-800 text-gray-400",
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-2">{field.hint}</p>}

      {/* Link list */}
      {value.length > 0 && (
        <div className="space-y-2 mb-3">
          {value.map((link, i) => (
            <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${tagColors[link.tag] || tagColors.Autre}`}>
                {link.tag}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline truncate flex-1"
              >
                {link.title}
              </a>
              <button onClick={() => removeLink(i)} className="text-muted hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Add link form */}
      <div className="space-y-2 bg-background border border-border rounded-lg p-3">
        <div className="flex gap-2">
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Coller le lien ici..."
            className="flex-1 px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
        </div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre (optionnel)"
            className="flex-1 px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
          />
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground outline-none"
          >
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addLink}
            className="px-3 py-1.5 bg-accent text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCORE FIELD ─────────────────────────────

function ScoreField({ field, value, onChange }: { field: Field; value: number; onChange: (val: number) => void }) {
  const max = field.max || 10;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm flex-1">{field.label}</label>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className={`w-7 h-7 rounded text-xs font-medium transition-all ${
              n <= value
                ? n <= 3 ? "bg-red-600 text-white" : n <= 6 ? "bg-yellow-600 text-white" : "bg-green-600 text-white"
                : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span className={`text-sm font-bold w-8 text-right ${value <= 3 ? "text-red-400" : value <= 6 ? "text-yellow-400" : "text-green-400"}`}>
        {value > 0 ? value : "—"}
      </span>
    </div>
  );
}
