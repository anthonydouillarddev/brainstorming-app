"use client";

import { useMemo, useState } from "react";
import {
  exportCss,
  exportTailwind,
  exportDtcgJson,
  exportMarkdown,
  type DesignSystemSnapshot,
} from "@/lib/design/export";

type Format = "css" | "tailwind" | "json" | "markdown";

const FORMATS: {
  key: Format;
  label: string;
  emoji: string;
  ext: string;
  filename: string;
  hint: string;
}[] = [
  {
    key: "css",
    label: "CSS variables",
    emoji: "🎨",
    ext: "css",
    filename: "design-tokens.css",
    hint: ":root { --color-* } — à coller dans tes globals.css",
  },
  {
    key: "tailwind",
    label: "Tailwind v4 @theme",
    emoji: "💨",
    ext: "css",
    filename: "tailwind-theme.css",
    hint: "Syntaxe Tailwind v4 — remplace ton @theme",
  },
  {
    key: "json",
    label: "W3C DTCG JSON",
    emoji: "📦",
    ext: "json",
    filename: "tokens.json",
    hint: "Standard W3C Design Tokens — interop Figma / Style Dictionary",
  },
  {
    key: "markdown",
    label: "Markdown guidelines",
    emoji: "📄",
    ext: "md",
    filename: "design-system.md",
    hint: "Document lisible à coller dans Claude / Notion / brief designer",
  },
];

export default function ExportBlock({ snapshot }: { snapshot: DesignSystemSnapshot }) {
  const [collapsed, setCollapsed] = useState(true);
  const [format, setFormat] = useState<Format>("tailwind");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    if (format === "css") return exportCss(snapshot);
    if (format === "tailwind") return exportTailwind(snapshot);
    if (format === "json") return exportDtcgJson(snapshot);
    return exportMarkdown(snapshot);
  }, [format, snapshot]);

  const currentFormat = FORMATS.find((f) => f.key === format)!;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pas grave en dev
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
  }

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
        aria-label={collapsed ? "Déplier" : "Replier"}
      >
        {collapsed ? "▶" : "▼"}
        8. Export du design system
        <span className="text-muted font-normal text-sm">(4 formats)</span>
      </button>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher l&apos;export (CSS · Tailwind v4 · JSON · Markdown)
        </button>
      )}

      {!collapsed && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">À quoi ça sert ?</strong> Une fois ton design
            system finalisé (couleurs + tokens), tu l&apos;exportes dans le format que ton dev /
            outil attend. Le markdown est super pratique pour briefer Claude / ChatGPT pour qu&apos;ils
            génèrent du code aligné sur ton design.
          </div>

          {/* Sélecteur de format */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
          <pre className="bg-card/80 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
            {content}
          </pre>
        </>
      )}
    </div>
  );
}
