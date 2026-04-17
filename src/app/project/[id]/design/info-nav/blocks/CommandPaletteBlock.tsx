"use client";

import { useState } from "react";
import type { CommandAction, InfoNavState } from "../state";
import { makeCommandId } from "../state";
import BlockStatus from "../components/BlockStatus";

const SUGGESTED_COMMANDS: Omit<CommandAction, "id">[] = [
  { label: "Créer un nouveau projet", shortcut: "⌘N", scope: "global" },
  { label: "Rechercher partout", shortcut: "⌘K", scope: "global" },
  { label: "Aller à l'accueil", shortcut: "G H", scope: "global" },
  { label: "Paramètres", shortcut: "⌘,", scope: "global" },
  { label: "Dupliquer", shortcut: "⌘D", scope: "contextual" },
  { label: "Supprimer", shortcut: "⌘⌫", scope: "contextual" },
];

export default function CommandPaletteBlock({
  state,
  onChange,
}: {
  state: InfoNavState;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.commandPalette.length > 0);
  const ok = state.commandPalette.length >= 3;

  const existingLabels = new Set(state.commandPalette.map((c) => c.label.toLowerCase().trim()));
  const availableSuggestions = SUGGESTED_COMMANDS.filter(
    (c) => !existingLabels.has(c.label.toLowerCase().trim())
  );

  function addCommand(cmd?: Omit<CommandAction, "id">) {
    const next: CommandAction = cmd
      ? { ...cmd, id: makeCommandId() }
      : { id: makeCommandId(), label: "", shortcut: "", scope: "global" };
    onChange({ commandPalette: [...state.commandPalette, next] });
  }

  function updateCommand(id: string, patch: Partial<CommandAction>) {
    onChange({
      commandPalette: state.commandPalette.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function removeCommand(id: string) {
    onChange({ commandPalette: state.commandPalette.filter((c) => c.id !== id) });
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
          ⌘ Command palette planner
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">({state.commandPalette.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Pattern Linear / Notion / Raycast.</strong> Liste
            les actions globales atteignables en <code>⌘K</code>. Combine nav visible + command
            palette pour couvrir tout le spectre débutant→expert.
          </div>

          {state.commandPalette.length > 0 && (
            <div className="space-y-1">
              {state.commandPalette.map((cmd) => (
                <div
                  key={cmd.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center p-2 rounded border border-border bg-card"
                >
                  <input
                    type="text"
                    value={cmd.label}
                    onChange={(e) => updateCommand(cmd.id, { label: e.target.value })}
                    placeholder="Action (ex: Créer un projet)"
                    className="h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                  <input
                    type="text"
                    value={cmd.shortcut}
                    onChange={(e) => updateCommand(cmd.id, { shortcut: e.target.value })}
                    placeholder="⌘K"
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono w-20"
                  />
                  <select
                    value={cmd.scope}
                    onChange={(e) =>
                      updateCommand(cmd.id, { scope: e.target.value as CommandAction["scope"] })
                    }
                    className="h-8 px-2 text-xs rounded border border-border bg-card"
                  >
                    <option value="global">global</option>
                    <option value="contextual">contextuel</option>
                  </select>
                  <button
                    onClick={() => removeCommand(cmd.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouts rapides :</div>
              <div className="flex flex-wrap gap-1">
                {availableSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => addCommand(s)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {s.label} <span className="font-mono text-muted">{s.shortcut}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => addCommand()}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter une commande personnalisée
          </button>
        </>
      )}
    </div>
  );
}
