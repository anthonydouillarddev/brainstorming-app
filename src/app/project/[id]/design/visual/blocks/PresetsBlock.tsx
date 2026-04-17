"use client";

import { useEffect, useState } from "react";
import {
  fetchPresets,
  createPreset,
  deletePreset,
  type DesignPresetRow,
} from "@/lib/design/presets-api";
import { useToast } from "@/app/components/toast";
import CollapsibleSection from "../components/CollapsibleSection";
import type { VisualState } from "../state";
import { mergeVisualState } from "../state";

export default function PresetsBlock({
  projectId,
  currentState,
  onLoadPreset,
}: {
  projectId: string;
  currentState: VisualState;
  onLoadPreset: (state: VisualState) => void;
}) {
  const toast = useToast();
  const [presets, setPresets] = useState<DesignPresetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [scope, setScope] = useState<"project" | "global">("global");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await fetchPresets({ projectId });
      if (!cancelled) {
        setPresets(rows);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleSave() {
    const name = newName.trim();
    if (!name) {
      toast.error("Donne un nom à ton preset");
      return;
    }
    setSaving(true);
    try {
      const row = await createPreset({
        name,
        snapshot: currentState,
        projectId: scope === "project" ? projectId : null,
      });
      if (row) {
        setPresets((prev) => [row, ...prev]);
        setNewName("");
        toast.success(`Preset « ${row.name} » sauvegardé`);
      }
    } catch {
      toast.error("Sauvegarde impossible");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(preset: DesignPresetRow) {
    const prev = presets;
    setPresets(prev.filter((p) => p.id !== preset.id));
    try {
      await deletePreset(preset.id);
      toast.success(`Preset « ${preset.name} » supprimé`);
    } catch {
      setPresets(prev);
      toast.error("Suppression impossible");
    }
  }

  function handleLoad(preset: DesignPresetRow) {
    try {
      const merged = mergeVisualState(preset.snapshot as Partial<VisualState>);
      onLoadPreset(merged);
      toast.success(`Preset « ${preset.name} » chargé`);
    } catch {
      toast.error("Preset invalide");
    }
  }

  const count = presets.length;

  return (
    <div className="border-t border-border pt-6">
      <CollapsibleSection
        title="💾 Mes design systems"
        showCountInTitle={`(${count})`}
        expandButtonLabel={
          count === 0
            ? "Sauvegarder mon premier design system"
            : `Afficher mes ${count} design system${count > 1 ? "s" : ""}`
        }
      >
        <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
          <strong className="text-foreground">Sauvegarde ton DS complet</strong> (couleurs + tokens
          + fonts + composants) pour le réutiliser sur un autre projet. Portée{" "}
          <strong>globale</strong> : dispo sur tous tes projets. <strong>Projet</strong> : visible
          uniquement ici.
        </div>

        {/* Formulaire création */}
        <div className="bg-card/60 border border-border rounded-xl p-4 mt-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du preset (ex : Mindeck Moka v2)"
              className="h-9 px-3 text-sm rounded border border-border bg-card flex-1 min-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as "project" | "global")}
              className="h-9 px-2 text-sm rounded border border-border bg-card"
              title="Portée du preset"
            >
              <option value="global">🌍 Global</option>
              <option value="project">📌 Ce projet</option>
            </select>
            <button
              onClick={handleSave}
              disabled={saving || !newName.trim()}
              className="h-9 px-4 text-sm rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              {saving ? "Sauvegarde..." : "💾 Sauver le DS actuel"}
            </button>
          </div>
        </div>

        {/* Liste presets */}
        {loading ? (
          <div className="text-xs text-muted mt-3">Chargement des presets...</div>
        ) : presets.length === 0 ? (
          <div className="text-xs text-muted mt-3 bg-card/40 border border-dashed border-border rounded-lg p-4 text-center">
            Aucun preset sauvegardé pour l&apos;instant. Ton premier DS sauvegardé apparaîtra ici.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {presets.map((preset) => {
              const snap = preset.snapshot as Partial<VisualState>;
              const primaryHex = snap?.customColor ?? "#888888";
              const selectedColors = Array.isArray(snap?.selected)
                ? (snap?.selected as { hex: string }[]).slice(0, 5)
                : [];
              const isGlobal = preset.project_id === null;
              return (
                <div
                  key={preset.id}
                  className="bg-card/60 border border-border rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        <span>{isGlobal ? "🌍" : "📌"}</span>
                        <span className="truncate">{preset.name}</span>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {new Date(preset.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(preset)}
                      className="w-6 h-6 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 text-xs transition shrink-0"
                      title="Supprimer"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-8 h-8 rounded border border-border shrink-0"
                      style={{ background: primaryHex }}
                      title={`Primary : ${primaryHex}`}
                    />
                    <div className="flex-1 flex gap-0.5 h-8 rounded overflow-hidden border border-border">
                      {selectedColors.length > 0 ? (
                        selectedColors.map((c, i) => (
                          <div
                            key={`${preset.id}-${i}`}
                            className="flex-1"
                            style={{ background: c.hex }}
                            title={c.hex}
                          />
                        ))
                      ) : (
                        <div className="flex-1 bg-card/30 text-[9px] text-muted flex items-center justify-center">
                          pas de mariage
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLoad(preset)}
                    className="h-8 text-xs rounded bg-accent text-white hover:bg-accent-hover transition"
                  >
                    Charger ce DS
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
