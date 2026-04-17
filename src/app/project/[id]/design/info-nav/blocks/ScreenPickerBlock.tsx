"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { InfoNavState, SitemapScreen } from "../state";
import { makeScreenId, toSlug } from "../state";
import { SCREEN_TEMPLATES, screenFromTemplate } from "../templates";
import BlockStatus from "../components/BlockStatus";

export default function ScreenPickerBlock({
  state,
  projectType,
  onChange,
}: {
  state: InfoNavState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.screens.length === 0);
  const [customTitle, setCustomTitle] = useState("");

  const templates = projectType ? SCREEN_TEMPLATES[projectType] : [];
  const existingTitles = new Set(state.screens.map((s) => s.title.toLowerCase().trim()));
  const availableTemplates = templates.filter(
    (t) => !existingTitles.has(t.title.toLowerCase().trim())
  );

  const ok = state.screens.length >= 3;

  function addScreen(template: (typeof templates)[number]) {
    const rootChildren = state.screens.filter((s) => s.parentId === null);
    const screen = screenFromTemplate(template, null, rootChildren.length);
    const navItems = template.isPrimaryNav ? [...state.navItems, screen.id] : state.navItems;
    onChange({
      screens: [...state.screens, screen],
      navItems,
    });
  }

  function addCustom() {
    const title = customTitle.trim();
    if (!title) return;
    const rootChildren = state.screens.filter((s) => s.parentId === null);
    const screen: SitemapScreen = {
      id: makeScreenId(),
      title,
      slug: toSlug(title),
      emoji: "📄",
      parentId: null,
      position: rootChildren.length,
      isPrimaryNav: true,
      description: "",
    };
    onChange({
      screens: [...state.screens, screen],
      navItems: [...state.navItems, screen.id],
    });
    setCustomTitle("");
  }

  function addAllSuggested() {
    if (availableTemplates.length === 0) return;
    const primaries = availableTemplates.filter((t) => t.isPrimaryNav);
    let position = state.screens.filter((s) => s.parentId === null).length;
    const newScreens = primaries.map((tpl) => {
      const screen = screenFromTemplate(tpl, null, position);
      position += 1;
      return screen;
    });
    onChange({
      screens: [...state.screens, ...newScreens],
      navItems: [...state.navItems, ...newScreens.filter((s) => s.isPrimaryNav).map((s) => s.id)],
    });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🏠 Les pièces de ton app
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.screens.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {!expanded && state.screens.length > 0 && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {state.screens
            .filter((s) => s.parentId === null)
            .slice(0, 6)
            .map((s) => `${s.emoji ?? "📄"} ${s.title}`)
            .join(" · ")}
          {state.screens.filter((s) => s.parentId === null).length > 6 && "…"}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Commence simple.</strong> Coche les 5 à 7 écrans
            clés de ton app. On en déduira le sitemap et la nav. Tu pourras toujours ajouter, en
            enlever, ou en ajouter des sous-pages après.
          </div>

          {availableTemplates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-muted">
                  Écrans suggérés pour un projet <strong>{projectType}</strong> :
                </div>
                <button
                  onClick={addAllSuggested}
                  className="text-[11px] px-2.5 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition"
                >
                  + Tout ajouter ({availableTemplates.filter((t) => t.isPrimaryNav).length})
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableTemplates.map((tpl) => (
                  <button
                    key={tpl.title}
                    onClick={() => addScreen(tpl)}
                    className="text-left p-3 rounded-lg border border-border bg-card hover:border-accent hover:bg-accent/5 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tpl.emoji}</span>
                      <span className="font-semibold text-sm">{tpl.title}</span>
                      {tpl.isPrimaryNav && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent">
                          NAV
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">{tpl.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium">Créer un écran perso</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex : Bibliothèque"
                className="h-9 px-3 text-sm rounded border border-border bg-card flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustom();
                }}
              />
              <button
                onClick={addCustom}
                disabled={!customTitle.trim()}
                className="h-9 px-4 text-sm rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
