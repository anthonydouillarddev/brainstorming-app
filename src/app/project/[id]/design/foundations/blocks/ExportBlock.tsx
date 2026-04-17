"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { useToast } from "@/app/components/toast";
import { exportFoundationsMd } from "../exports/markdown";
import { exportFoundationsJson } from "../exports/json";
import { exportClaudeBrief } from "../exports/claude-brief";
import { exportFoundationsChecklist } from "../exports/checklist";
import type { FoundationsState } from "../state";

type Format = "markdown" | "json" | "claude" | "checklist";

const FORMATS: {
  key: Format;
  label: string;
  emoji: string;
  filename: string;
  hint: string;
}[] = [
  {
    key: "markdown",
    label: "Markdown guidelines",
    emoji: "📄",
    filename: "foundations.md",
    hint: "Doc lisible · coller dans Notion / brief / doc équipe",
  },
  {
    key: "claude",
    label: "Brief Claude / ChatGPT",
    emoji: "🤖",
    filename: "brief-claude.md",
    hint: "Prompt pré-formaté pour générer des livrables alignés",
  },
  {
    key: "checklist",
    label: "Checklist décision",
    emoji: "✅",
    filename: "checklist-decision.md",
    hint: "10 questions à se poser avant chaque décision design",
  },
  {
    key: "json",
    label: "JSON structuré",
    emoji: "📦",
    filename: "foundations.json",
    hint: "Format structuré pour réinjection (chap 2-12, AI, tooling)",
  },
];

export default function FoundationsExportBlock({
  state,
  project,
}: {
  state: FoundationsState;
  project: Project;
}) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(true);
  const [format, setFormat] = useState<Format>("markdown");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    switch (format) {
      case "markdown":
        return exportFoundationsMd(state, project);
      case "json":
        return exportFoundationsJson(state, project);
      case "claude":
        return exportClaudeBrief(state, project);
      case "checklist":
        return exportFoundationsChecklist(state, project);
    }
  }, [format, state, project]);

  const currentFormat = FORMATS.find((f) => f.key === format)!;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(`${currentFormat.label} copié dans le presse-papier`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copie impossible");
    }
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFormat.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${currentFormat.filename} téléchargé`);
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        📤 Export des fondations
        <span className="text-muted font-normal text-sm">(4 formats)</span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Voir les exports (Markdown · Claude brief · Checklist · JSON)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 formats selon l&apos;usage</strong> — Markdown
            pour coller dans Notion/un brief, Brief Claude pour générer du code/design aligné, JSON
            pour réinjection dans les chap. suivants ou un outil AI, Checklist pour l&apos;imprimer
            et l&apos;épingler au bureau.
          </div>

          {/* Sélecteur de format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key)}
                className={`p-3 rounded-lg border transition text-left ${
                  format === f.key
                    ? "bg-accent/10 border-accent"
                    : "border-border hover:bg-accent/5"
                }`}
              >
                <div className="text-sm font-semibold">
                  {f.emoji} {f.label}
                </div>
                <div className="text-[10px] text-muted mt-0.5">{f.hint}</div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
            >
              {copied ? "✓ Copié" : "📋 Copier"}
            </button>
            <button
              onClick={handleDownload}
              className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition flex items-center gap-2"
            >
              ⬇ Télécharger {currentFormat.filename}
            </button>
            <span className="text-xs text-muted ml-auto">
              {content.length.toLocaleString("fr-FR")} caractères
            </span>
          </div>

          {/* Aperçu */}
          <pre className="bg-card/80 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
            {content}
          </pre>
        </>
      )}
    </div>
  );
}
