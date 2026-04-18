"use client";

import { useState } from "react";
import type { InfoNavState, SitemapScreen } from "../state";
import {
  getChildren,
  getScreenDepth,
  makeScreenId,
  toSlug,
} from "../state";
import { validateScreens } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function SitemapBuilderBlock({
  state,
  onChange,
}: {
  state: InfoNavState;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.screens.length > 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const issues = validateScreens(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.screens.length >= 3 && !hasError;

  function updateScreen(id: string, patch: Partial<SitemapScreen>) {
    onChange({
      screens: state.screens.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function removeScreen(id: string) {
    // Supprime aussi les enfants récursivement
    const toRemove = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const s of state.screens) {
        if (s.parentId && toRemove.has(s.parentId) && !toRemove.has(s.id)) {
          toRemove.add(s.id);
          changed = true;
        }
      }
    }
    const nextScreens = state.screens.filter((s) => !toRemove.has(s.id));
    const nextNavItems = state.navItems.filter((nid) => !toRemove.has(nid));
    onChange({ screens: nextScreens, navItems: nextNavItems });
  }

  function addSubPage(parentId: string) {
    const siblings = getChildren(state, parentId);
    const screen: SitemapScreen = {
      id: makeScreenId(),
      title: "Nouvelle page",
      slug: toSlug("Nouvelle page"),
      emoji: "📄",
      parentId,
      position: siblings.length,
      isPrimaryNav: false,
      description: "",
    };
    onChange({ screens: [...state.screens, screen] });
    setEditingId(screen.id);
  }

  function moveScreen(screenId: string, dir: -1 | 1) {
    const screen = state.screens.find((s) => s.id === screenId);
    if (!screen) return;
    const siblings = getChildren(state, screen.parentId);
    const index = siblings.findIndex((s) => s.id === screenId);
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const newSiblings = [...siblings];
    [newSiblings[index], newSiblings[targetIndex]] = [
      newSiblings[targetIndex],
      newSiblings[index],
    ];
    const updatedScreens = state.screens.map((s) => {
      const idx = newSiblings.findIndex((x) => x.id === s.id);
      return idx >= 0 ? { ...s, position: idx } : s;
    });
    onChange({ screens: updatedScreens });
  }

  function toggleNav(screenId: string) {
    const screen = state.screens.find((s) => s.id === screenId);
    if (!screen) return;
    const newValue = !screen.isPrimaryNav;
    updateScreen(screenId, { isPrimaryNav: newValue });
    if (newValue && !state.navItems.includes(screenId)) {
      onChange({ navItems: [...state.navItems, screenId] });
    } else if (!newValue) {
      onChange({ navItems: state.navItems.filter((id) => id !== screenId) });
    }
  }

  const rootScreens = getChildren(state, null);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🗺️ Sitemap builder
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Plan de ton app.</strong> Edite le titre, ajoute
            des sous-pages, réordonne avec ↑↓, bascule dans la nav principale ou non.
            <strong className="text-foreground"> Règle NN/g</strong> : max 7 items racines, max 3
            niveaux de profondeur.
          </div>

          {rootScreens.length === 0 ? (
            <div className="bg-card/40 border border-dashed border-border rounded-lg p-6 text-xs text-muted text-center">
              Aucun écran pour l&apos;instant. Commence par utiliser le Screen Picker ci-dessus
              pour ajouter tes premières pages.
            </div>
          ) : (
            <div className="space-y-1">
              {rootScreens.map((screen, index) => (
                <ScreenRow
                  key={screen.id}
                  screen={screen}
                  state={state}
                  index={index}
                  siblings={rootScreens}
                  editingId={editingId}
                  onEdit={(id) => setEditingId(id)}
                  onCancel={() => setEditingId(null)}
                  onUpdate={updateScreen}
                  onRemove={removeScreen}
                  onAddSubPage={addSubPage}
                  onMove={moveScreen}
                  onToggleNav={toggleNav}
                />
              ))}
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function ScreenRow({
  screen,
  state,
  index,
  siblings,
  editingId,
  onEdit,
  onCancel,
  onUpdate,
  onRemove,
  onAddSubPage,
  onMove,
  onToggleNav,
}: {
  screen: SitemapScreen;
  state: InfoNavState;
  index: number;
  siblings: SitemapScreen[];
  editingId: string | null;
  onEdit: (id: string) => void;
  onCancel: () => void;
  onUpdate: (id: string, patch: Partial<SitemapScreen>) => void;
  onRemove: (id: string) => void;
  onAddSubPage: (parentId: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleNav: (id: string) => void;
}) {
  const children = getChildren(state, screen.id);
  const depth = getScreenDepth(state, screen.id);
  const isEditing = editingId === screen.id;
  const indentPx = depth * 16;

  return (
    <>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded border transition ${
          isEditing ? "border-accent bg-accent/5" : "border-transparent hover:bg-card/60"
        }`}
        style={{ marginLeft: indentPx }}
      >
        <div className="flex flex-col">
          <button
            onClick={() => onMove(screen.id, -1)}
            disabled={index === 0}
            className="w-4 h-4 rounded text-[10px] text-muted hover:text-foreground hover:bg-accent/10 disabled:opacity-30"
            aria-label="Monter"
          >
            ▲
          </button>
          <button
            onClick={() => onMove(screen.id, 1)}
            disabled={index === siblings.length - 1}
            className="w-4 h-4 rounded text-[10px] text-muted hover:text-foreground hover:bg-accent/10 disabled:opacity-30"
            aria-label="Descendre"
          >
            ▼
          </button>
        </div>

        <span className="text-lg">{screen.emoji ?? "📄"}</span>

        {isEditing ? (
          <input
            type="text"
            value={screen.title}
            autoFocus
            onChange={(e) =>
              onUpdate(screen.id, { title: e.target.value, slug: toSlug(e.target.value) })
            }
            onBlur={onCancel}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") onCancel();
            }}
            className="h-7 px-2 text-sm rounded border border-border bg-card flex-1"
          />
        ) : (
          <button
            onClick={() => onEdit(screen.id)}
            className="flex-1 text-left text-sm font-medium hover:text-accent transition truncate"
          >
            {screen.title}
          </button>
        )}

        <span className="text-[10px] font-mono text-muted hidden sm:inline">/{screen.slug}</span>

        <button
          onClick={() => onToggleNav(screen.id)}
          className={`text-[10px] px-1.5 py-0.5 rounded transition ${
            screen.isPrimaryNav
              ? "bg-accent/20 text-accent"
              : "text-muted hover:bg-accent/10"
          }`}
          title={screen.isPrimaryNav ? "Dans la nav principale" : "Ajouter à la nav"}
        >
          {screen.isPrimaryNav ? "NAV" : "+ nav"}
        </button>

        <button
          onClick={() => onAddSubPage(screen.id)}
          disabled={depth >= 2}
          className="text-[11px] px-2 py-0.5 rounded text-muted hover:bg-accent/10 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          title={depth >= 2 ? "Profondeur max atteinte" : "Ajouter une sous-page"}
        >
          + sous
        </button>

        <button
          onClick={() => onRemove(screen.id)}
          className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
          aria-label="Supprimer"
        >
          ×
        </button>
      </div>
      {children.map((child, i) => (
        <ScreenRow
          key={child.id}
          screen={child}
          state={state}
          index={i}
          siblings={children}
          editingId={editingId}
          onEdit={onEdit}
          onCancel={onCancel}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onAddSubPage={onAddSubPage}
          onMove={onMove}
          onToggleNav={onToggleNav}
        />
      ))}
    </>
  );
}
