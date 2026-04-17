"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { useToast } from "@/app/components/toast";
import { exportInfoNavMd } from "../exports/markdown";
import { exportInfoNavJson } from "../exports/json";
import { exportUrlMapCsv } from "../exports/csv";
import { exportClaudeBrief } from "../exports/claude-brief";
import type { InfoNavState } from "../state";

type Format = "markdown" | "claude" | "json" | "csv";

const FORMATS: {
  key: Format;
  label: string;
  emoji: string;
  filename: string;
  hint: string;
}[] = [
  {
    key: "markdown",
    label: "Sitemap Markdown",
    emoji: "📄",
    filename: "sitemap.md",
    hint: "Doc lisible · coller dans Notion / brief freelance",
  },
  {
    key: "claude",
    label: "Brief Claude / ChatGPT",
    emoji: "🤖",
    filename: "brief-nav.md",
    hint: "Prompt pour générer routes Next.js / nav / SQL",
  },
  {
    key: "json",
    label: "Info model JSON",
    emoji: "📦",
    filename: "info-nav.json",
    hint: "Sitemap + entités + labels + URL map structurés",
  },
  {
    key: "csv",
    label: "URL map CSV",
    emoji: "📊",
    filename: "url-map.csv",
    hint: "Toutes les routes avec breadcrumb (Excel/Sheets)",
  },
];

export default function InfoNavExportBlock({
  state,
  project,
}: {
  state: InfoNavState;
  project: Project;
}) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(true);
  const [format, setFormat] = useState<Format>("markdown");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    switch (format) {
      case "markdown":
        return exportInfoNavMd(state, project);
      case "claude":
        return exportClaudeBrief(state, project);
      case "json":
        return exportInfoNavJson(state, project);
      case "csv":
        return exportUrlMapCsv(state);
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
        📤 Export architecture
        <span className="text-muted font-normal text-sm">(4 formats)</span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Voir les exports (MD · Claude brief · JSON · CSV)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 formats</strong> — Markdown pour brief, Claude
            brief pour générer du code, JSON structuré pour tooling, CSV pour l&apos;intégrer dans
            un spreadsheet.
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
