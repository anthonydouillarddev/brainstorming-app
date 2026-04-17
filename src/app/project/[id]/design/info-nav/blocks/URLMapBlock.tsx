"use client";

import { useState } from "react";
import type { InfoNavState } from "../state";
import { getScreenPath } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function URLMapBlock({ state }: { state: InfoNavState }) {
  const [expanded, setExpanded] = useState(false);
  const ok = state.screens.length > 0;

  const urls = state.screens.map((screen) => {
    const path = getScreenPath(state, screen.id);
    const fullPath = "/" + path.map((p) => p.slug).join("/");
    const breadcrumb = path.map((p) => p.title).join(" › ");
    return { screen, fullPath, breadcrumb };
  });

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🔗 URL map &amp; breadcrumbs
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({urls.length} routes)</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Auto-généré depuis le sitemap.</strong> Les URLs
            dérivent des slugs et de la hiérarchie. Les breadcrumbs se déduisent du chemin
            parent-enfant. Édite les slugs dans le Sitemap Builder ci-dessus.
          </div>

          {urls.length === 0 ? (
            <div className="text-xs text-muted italic text-center py-4">
              Ajoute des écrans dans le Sitemap pour voir leurs URLs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted text-[10px] uppercase tracking-wider">
                    <th className="text-left py-2 px-2">Écran</th>
                    <th className="text-left py-2 px-2">URL</th>
                    <th className="text-left py-2 px-2">Breadcrumb</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map(({ screen, fullPath, breadcrumb }) => (
                    <tr key={screen.id} className="border-b border-border/50">
                      <td className="py-1.5 px-2">
                        {screen.emoji ?? "📄"} {screen.title}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-accent">{fullPath}</td>
                      <td className="py-1.5 px-2 text-muted">{breadcrumb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
