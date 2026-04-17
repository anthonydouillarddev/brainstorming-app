"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { useToast } from "@/app/components/toast";
import { exportFlowsMd } from "../exports/markdown";
import { exportFlowsMermaid } from "../exports/mermaid";
import { exportFlowsJson } from "../exports/json";
import { exportFlowsClaudeBrief } from "../exports/claude-brief";
import type { FlowsState } from "../state";

type Format = "markdown" | "claude" | "mermaid" | "json";

const FORMATS: {
  key: Format;
  label: string;
  emoji: string;
  filename: string;
  hint: string;
}[] = [
  {
    key: "markdown",
    label: "Parcours Markdown",
    emoji: "📄",
    filename: "flows.md",
    hint: "Doc lisible · coller dans Notion / brief",
  },
  {
    key: "claude",
    label: "Brief Claude / ChatGPT",
    emoji: "🤖",
    filename: "brief-flows.md",
    hint: "Prompt pour générer copies onboarding + events",
  },
  {
    key: "mermaid",
    label: "Mermaid flowchart",
    emoji: "🔀",
    filename: "flows.mmd",
    hint: "Diagramme visuel — colle dans mermaid.live",
  },
  {
    key: "json",
    label: "JSON structuré",
    emoji: "📦",
    filename: "flows.json",
    hint: "Format structuré pour AI tooling",
  },
];

export default function FlowsExportBlock({
  state,
  project,
}: {
  state: FlowsState;
  project: Project;
}) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(true);
  const [format, setFormat] = useState<Format>("markdown");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    switch (format) {
      case "markdown":
        return exportFlowsMd(state, project);
      case "claude":
        return exportFlowsClaudeBrief(state, project);
      case "mermaid":
        return exportFlowsMermaid(state);
      case "json":
        return exportFlowsJson(state, project);
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
      >
        {collapsed ? "▶" : "▼"}
        📤 Export parcours
        <span className="text-muted font-normal text-sm">(4 formats)</span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Voir les exports (MD · Claude brief · Mermaid · JSON)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 formats</strong> — Markdown lisible, Brief Claude
            pour générer copy/analytics, Mermaid pour visualiser le flow (colle sur{" "}
            <code>mermaid.live</code>), JSON pour tooling AI.
          </div>

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

          <pre className="bg-card/80 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
            {content}
          </pre>
        </>
      )}
    </div>
  );
}
