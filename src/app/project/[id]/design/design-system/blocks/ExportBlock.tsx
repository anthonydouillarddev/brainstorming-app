"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { useToast } from "@/app/components/toast";
import { exportDesignSystemMd } from "../exports/markdown";
import type { DesignSystemState } from "../state";

export default function DsExportBlock({
  state,
  project,
}: {
  state: DesignSystemState;
  project: Project;
}) {
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => exportDesignSystemMd(state, project), [state, project]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Design system copié dans le presse-papier");
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
    a.download = "design-system.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("design-system.md téléchargé");
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-expanded={!collapsed}
      >
        {collapsed ? "▶" : "▼"}
        📤 Export design system
        <span className="text-muted font-normal text-sm">(markdown)</span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Voir l&apos;export (prêt à coller dans Claude / brief)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Usage</strong> : colle dans Claude pour qu&apos;il
            génère les composants React/CSS, les specs Storybook, ou les checklists Figma.
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
              ⬇ Télécharger design-system.md
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
