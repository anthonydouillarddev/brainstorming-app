"use client";

import { useState } from "react";
import type { StrategyState } from "../state";
import { exportStrategyMarkdown } from "../exports/markdown";
import { exportStrategyJson } from "../exports/json";
import { exportStrategyClaudeBrief } from "../exports/claude-brief";

type Format = "markdown" | "json" | "claude";

const FORMATS: { value: Format; label: string; hint: string; ext: string; mime: string }[] = [
  {
    value: "markdown",
    label: "📄 Markdown",
    hint: "Note archivable, compatible GitHub/Obsidian/Notion",
    ext: "md",
    mime: "text/markdown",
  },
  {
    value: "json",
    label: "📦 JSON",
    hint: "Shape versionné — réutilisable par un autre outil",
    ext: "json",
    mime: "application/json",
  },
  {
    value: "claude",
    label: "🤖 Claude brief",
    hint: "Prompt prêt à coller dans Claude pour scaffolder l'architecture",
    ext: "md",
    mime: "text/markdown",
  },
];

export default function ExportBlock({
  state,
  projectName,
}: {
  state: StrategyState;
  projectName: string;
}) {
  const [format, setFormat] = useState<Format>("markdown");
  const [copied, setCopied] = useState(false);

  function generate(): string {
    if (format === "json") return exportStrategyJson(state, projectName);
    if (format === "claude") return exportStrategyClaudeBrief(state, projectName);
    return exportStrategyMarkdown(state, projectName);
  }

  async function copy() {
    await navigator.clipboard.writeText(generate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const selected = FORMATS.find((f) => f.value === format)!;
    const blob = new Blob([generate()], { type: selected.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-strategie-technique.${selected.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const preview = generate();

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold">📤 Exports</h3>
        <p className="text-xs text-muted mt-0.5">
          Télécharge ta stratégie dans le format qui te sert — Markdown pour Obsidian, JSON pour tes
          outils, Claude brief pour scaffolder avec une IA.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFormat(f.value)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
              format === f.value
                ? "bg-accent text-white shadow-sm"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted">{FORMATS.find((f) => f.value === format)?.hint}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition"
        >
          {copied ? "✓ Copié !" : "📋 Copier"}
        </button>
        <button
          type="button"
          onClick={download}
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-card border border-border font-medium hover:border-accent transition"
        >
          💾 Télécharger
        </button>
      </div>

      <details>
        <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
          Aperçu ({preview.length} caractères)
        </summary>
        <pre className="mt-2 p-3 bg-background/80 border border-border rounded-xl text-[11px] font-mono overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
          {preview}
        </pre>
      </details>
    </section>
  );
}
