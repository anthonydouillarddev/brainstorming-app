"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { SectionDef, Field } from "@/lib/sections";
import { getActiveSections } from "@/lib/sections";
import type { Project } from "@/lib/types";

interface LinkItem {
  title: string;
  url: string;
  tag: string;
}

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

function isFieldFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return false;
}

function countFilled(def: SectionDef, data: SectionData): number {
  return def.fields.filter((f) => isFieldFilled(data[f.key])).length;
}

export default function BrainstormEditor({
  project,
  initialSections,
  sectionDefs,
  onProjectUpdate,
}: {
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
}) {
  const parsedInitial = useMemo(() => parseInitial(initialSections), [initialSections]);
  const [sections, setSections] = useState<Record<string, SectionData>>(parsedInitial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [collapseOverride, setCollapseOverride] = useState<Record<string, "open" | "closed">>({});
  const [showModulePicker, setShowModulePicker] = useState(false);
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const supabase = createClient();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`brainstorm:collapse:${project.id}`);
      if (stored) {
        // Sync from external store (localStorage) after mount to avoid hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapseOverride(JSON.parse(stored) as Record<string, "open" | "closed">);
      }
    } catch {
      /* ignore */
    }
  }, [project.id]);

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

  const activeSections = useMemo(
    () => getActiveSections(project.type, project.disabled_sections),
    [project.type, project.disabled_sections]
  );

  function toggleManual(key: string, currentlyOpen: boolean) {
    setCollapseOverride((prev) => {
      const next = { ...prev, [key]: currentlyOpen ? ("closed" as const) : ("open" as const) };
      if (typeof window !== "undefined") {
        localStorage.setItem(`brainstorm:collapse:${project.id}`, JSON.stringify(next));
      }
      return next;
    });
  }

  async function toggleSectionDisabled(sectionKey: string) {
    const disabled = project.disabled_sections.includes(sectionKey)
      ? project.disabled_sections.filter((k) => k !== sectionKey)
      : [...project.disabled_sections, sectionKey];
    await onProjectUpdate({ disabled_sections: disabled });
  }

  const scoreDef = sectionDefs.find((s) => s.key === "score");
  const scoreData = sections["score"] || {};
  const scoreFields = scoreDef?.fields.filter((f) => f.type === "score") ?? [];
  const totalScore = scoreFields.reduce((sum, f) => sum + (Number(scoreData[f.key]) || 0), 0);
  const maxScore = scoreFields.length * 10;

  function exportForClaude() {
    const lines: string[] = [];
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    lines.push(`# ${project.name}`);
    lines.push(`> Exporté le ${date} — Statut : ${project.status}`);
    lines.push("");

    for (const def of activeSections) {
      const data = sections[def.key] || {};
      if (!def.fields.some((f) => isFieldFilled(data[f.key]))) continue;

      lines.push("---");
      lines.push(`## ${def.emoji} ${def.title}`);
      lines.push("");

      for (const field of def.fields) {
        const val = data[field.key];
        if (!isFieldFilled(val)) continue;

        if (field.type === "question" || field.type === "text") {
          lines.push(`### ${field.label}`);
          if (field.hint) lines.push(`_${field.hint}_`);
          lines.push("");
          lines.push((val as string).trim());
          lines.push("");
        }
        if (field.type === "choice") {
          const selected = val as string[];
          lines.push(`### ${field.label}`);
          for (const s of selected) lines.push(`- [x] ${s}`);
          for (const u of (field.options ?? []).filter((o) => !selected.includes(o))) {
            lines.push(`- [ ] ${u}`);
          }
          lines.push("");
        }
        if (field.type === "links") {
          const links = val as LinkItem[];
          lines.push(`### ${field.label}`);
          for (const link of links) lines.push(`- [${link.tag}] [${link.title}](${link.url})`);
          lines.push("");
        }
        if (field.type === "score") {
          lines.push(`- **${field.label}** : ${val}/${field.max ?? 10}`);
        }
      }
      lines.push("");
    }

    if (totalScore > 0) {
      lines.push("---");
      lines.push(`## Score total : ${totalScore}/${maxScore}`);
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brainstorming.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Save indicator + modules picker toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowModulePicker((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-xl bg-card border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
        >
          ⚙️ Modules {showModulePicker ? "▾" : "▸"}
        </button>
        <div className="flex items-center gap-3 text-xs">
          {saving && <span className="text-muted">Sauvegarde...</span>}
          {lastSaved && !saving && <span className="text-green-500">✓ {lastSaved}</span>}
          {maxScore > 0 && (
            <span
              className={`font-bold ${
                totalScore >= maxScore * 0.7
                  ? "text-green-500"
                  : totalScore >= maxScore * 0.4
                  ? "text-yellow-500"
                  : "text-red-400"
              }`}
            >
              {totalScore}/{maxScore}
            </span>
          )}
        </div>
      </div>

      {/* Module picker */}
      {showModulePicker && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Activer / désactiver les modules
          </h3>
          <p className="text-xs text-muted mb-4">
            Par défaut, seules les sections pertinentes pour un projet de type{" "}
            <span className="font-semibold text-foreground">{project.type}</span> sont affichées.
            Tu peux ajouter ou retirer des modules manuellement.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {sectionDefs.map((def) => {
              const isDefault = def.defaultForTypes.includes(project.type);
              const isDisabled = project.disabled_sections.includes(def.key);
              const isActive = isDefault && !isDisabled;
              return (
                <label
                  key={def.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40"
                      : "bg-background/60 border-border hover:border-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleSectionDisabled(def.key)}
                    className="accent-accent"
                  />
                  <span className="text-base">{def.emoji}</span>
                  <span className="text-sm flex-1 truncate">{def.title}</span>
                  {!isDefault && (
                    <span className="text-[9px] uppercase tracking-wider text-muted">override</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {activeSections.map((def) => {
          const data = sections[def.key] || {};
          const filledCount = countFilled(def, data);
          const isComplete = filledCount === def.fields.length && def.fields.length > 0;
          const override = collapseOverride[def.key];
          const isOpen = override ? override === "open" : !isComplete;

          return (
            <div
              key={def.key}
              className={`bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm transition-all ${
                isComplete ? "border-green-500/40" : "border-border"
              }`}
            >
              <button
                onClick={() => toggleManual(def.key, isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{def.emoji}</span>
                    <h2 className="font-bold text-base">{def.title}</h2>
                    {isComplete && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 font-semibold uppercase tracking-wider">
                        ✓ complet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 ml-8">{def.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {filledCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isComplete
                          ? "bg-green-500/15 text-green-500"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {filledCount}/{def.fields.length}
                    </span>
                  )}
                  <span className="text-muted text-sm">{isOpen ? "▾" : "▸"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 space-y-5 border-t border-border">
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
          );
        })}
      </div>

      {/* Export */}
      <div className="pt-4">
        <button
          onClick={exportForClaude}
          className="w-full py-3 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
        >
          📥 Exporter pour Claude
        </button>
      </div>
    </div>
  );
}

// ─── FIELD RENDERER ──────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
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

function QuestionField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={2}
        className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted/30 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y min-h-[60px] transition-all"
      />
    </div>
  );
}

function TextField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted/30 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y min-h-[120px] transition-all"
      />
    </div>
  );
}

function ChoiceField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  function toggle(option: string) {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else onChange([...value, option]);
  }
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-muted mb-2 pl-0.5 border-l-2 border-accent/30 ml-0.5 px-2">
          {field.hint}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {field.options?.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`text-sm px-3.5 py-2 rounded-xl border transition-all ${
              value.includes(option)
                ? "bg-accent/15 border-accent/50 text-accent font-medium shadow-sm"
                : "bg-background/60 border-border text-muted hover:text-foreground hover:border-muted"
            }`}
          >
            {value.includes(option) ? "✓ " : ""}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function LinksField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: LinkItem[];
  onChange: (val: LinkItem[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("Autre");
  const tags = ["TikTok", "YouTube", "Article", "Produit", "Design", "Doc", "Autre"];

  function addLink() {
    if (!newUrl.trim()) return;
    const safeUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`;
    let title = newTitle.trim();
    if (!title) {
      try {
        title = new URL(safeUrl).hostname;
      } catch {
        title = safeUrl;
      }
    }
    onChange([...value, { title, url: safeUrl, tag: newTag }]);
    setNewUrl("");
    setNewTitle("");
    setNewTag("Autre");
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const tagColors: Record<string, string> = {
    TikTok: "bg-pink-500/15 text-pink-500",
    YouTube: "bg-red-500/15 text-red-500",
    Article: "bg-blue-500/15 text-blue-500",
    Produit: "bg-green-500/15 text-green-500",
    Design: "bg-purple-500/15 text-purple-500",
    Doc: "bg-cyan-500/15 text-cyan-500",
    Autre: "bg-muted/15 text-muted",
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{field.label}</label>
      {field.hint && <p className="text-xs text-muted mb-2">{field.hint}</p>}

      {value.length > 0 && (
        <div className="space-y-2 mb-3">
          {value.map((link, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-background/60 border border-border rounded-xl px-3 py-2"
            >
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
              <button
                onClick={() => removeLink(i)}
                className="text-muted hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 bg-background/60 border border-border rounded-xl p-3">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Coller le lien ici..."
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
          onKeyDown={(e) => e.key === "Enter" && addLink()}
        />
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre (optionnel)"
            className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
          />
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="px-2 py-2 bg-card border border-border rounded-lg text-sm text-foreground outline-none"
          >
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addLink}
            className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (val: number) => void;
}) {
  const max = field.max || 10;
  return (
    <div className="flex items-center gap-3 py-1">
      <label className="text-sm font-medium flex-1">{field.label}</label>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className={`w-7 h-7 rounded text-xs font-medium transition-all ${
              n <= value
                ? n <= 3
                  ? "bg-red-600 text-white"
                  : n <= 6
                  ? "bg-yellow-600 text-white"
                  : "bg-green-600 text-white"
                : "bg-background/60 border border-border text-muted hover:text-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span
        className={`text-sm font-bold w-8 text-right ${
          value <= 3 ? "text-red-400" : value <= 6 ? "text-yellow-400" : "text-green-400"
        }`}
      >
        {value > 0 ? value : "—"}
      </span>
    </div>
  );
}
