"use client";

import { useState } from "react";

export interface ExportFormat {
  value: string;
  label: string;
  hint: string;
  ext: string;
  mime: string;
  generate: () => string;
}

// Panneau d'exports générique : select format + copier + télécharger + preview.
export default function ExportPanel({
  formats,
  projectName,
  filenamePrefix,
}: {
  formats: ExportFormat[];
  projectName: string;
  filenamePrefix: string; // ex: "strategie-technique"
}) {
  const [formatValue, setFormatValue] = useState<string>(formats[0]?.value ?? "");
  const [copied, setCopied] = useState(false);

  const selected = formats.find((f) => f.value === formatValue) ?? formats[0];
  if (!selected) return null;

  const preview = selected.generate();

  async function copy() {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([preview], { type: selected.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-${filenamePrefix}.${selected.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold">📤 Exports</h3>
        <p className="text-xs text-muted mt-0.5">
          Copie ou télécharge dans le format qui te sert.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {formats.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFormatValue(f.value)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
              formatValue === f.value
                ? "bg-accent text-white shadow-sm"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted">{selected.hint}</p>

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
