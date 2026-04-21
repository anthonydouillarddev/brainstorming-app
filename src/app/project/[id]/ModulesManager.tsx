"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProjectModule, TabModule } from "@/lib/types";
import { toggleProjectModule } from "./actions";

export type ProjectModuleWithMeta = ProjectModule & { module: TabModule };

type Props = {
  open: boolean;
  projectId: string;
  initialModules: ProjectModuleWithMeta[];
  onClose: () => void;
  onModulesChange?: (modules: ProjectModuleWithMeta[]) => void;
};

type AllModuleRow = ProjectModuleWithMeta & { ghostId: string };

export default function ModulesManager({
  open,
  projectId,
  initialModules,
  onClose,
  onModulesChange,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [allModules, setAllModules] = useState<TabModule[]>([]);
  const [rows, setRows] = useState<ProjectModuleWithMeta[]>(initialModules);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPortalContainer(document.getElementById("modal-root"));
  }, []);

  useEffect(() => {
    setRows(initialModules);
  }, [initialModules]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("tab_modules")
        .select("id, slug, name, icon, is_universal, is_mandatory, component_key");
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }
      const modules = (data ?? []).map((m) => ({
        id: m.id,
        slug: m.slug,
        name: m.name,
        icon: m.icon,
        isUniversal: m.is_universal,
        isMandatory: m.is_mandatory,
        componentKey: m.component_key,
      })) as TabModule[];
      setAllModules(modules);
      setLoading(false);
    }
    load();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supabase]);

  function handleClose() {
    router.refresh();
    onClose();
  }

  const combinedRows = useMemo<AllModuleRow[]>(() => {
    const byModuleId = new Map<string, ProjectModuleWithMeta>();
    for (const r of rows) byModuleId.set(r.moduleId, r);
    const all: AllModuleRow[] = [];
    for (const mod of allModules) {
      const existing = byModuleId.get(mod.id);
      if (existing) {
        all.push({ ...existing, ghostId: existing.id });
      } else {
        all.push({
          id: `ghost-${mod.id}`,
          projectId,
          moduleId: mod.id,
          enabled: false,
          displayOrder: 999,
          module: mod,
          ghostId: `ghost-${mod.id}`,
        });
      }
    }
    all.sort((a, b) => {
      if (a.module.isMandatory !== b.module.isMandatory) {
        return a.module.isMandatory ? -1 : 1;
      }
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    });
    return all;
  }, [allModules, rows, projectId]);

  async function handleToggle(row: AllModuleRow, nextEnabled: boolean) {
    if (row.module.isMandatory) return;
    if (busy[row.moduleId]) return;

    setBusy((prev) => ({ ...prev, [row.moduleId]: true }));
    setError(null);

    const previousRows = rows;
    const existingIdx = rows.findIndex((r) => r.moduleId === row.moduleId);
    let optimisticRows: ProjectModuleWithMeta[];
    if (existingIdx >= 0) {
      optimisticRows = rows.map((r) =>
        r.moduleId === row.moduleId ? { ...r, enabled: nextEnabled } : r
      );
    } else {
      optimisticRows = [
        ...rows,
        {
          id: row.ghostId,
          projectId,
          moduleId: row.moduleId,
          enabled: nextEnabled,
          displayOrder: row.displayOrder,
          module: row.module,
        },
      ];
    }
    setRows(optimisticRows);
    onModulesChange?.(optimisticRows);

    const result = await toggleProjectModule(projectId, row.moduleId, nextEnabled);

    setBusy((prev) => {
      const next = { ...prev };
      delete next[row.moduleId];
      return next;
    });

    if (!result.ok) {
      setRows(previousRows);
      onModulesChange?.(previousRows);
      setError(result.error);
    }
  }

  if (!open || !portalContainer) return null;

  const drawer = (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Gérer les modules">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative ml-auto w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Modules du projet</h2>
            <p className="text-xs text-muted mt-0.5">
              Active ou désactive les onglets à la volée
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-background/60 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-500">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-muted text-sm text-center py-8">Chargement…</div>
          ) : (
            combinedRows.map((row) => {
              const mandatory = row.module.isMandatory;
              const isBusy = !!busy[row.moduleId];
              return (
                <div
                  key={row.moduleId}
                  className={`flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors ${
                    mandatory
                      ? "bg-background/40 border-border"
                      : row.enabled
                      ? "bg-accent/10 border-accent/40"
                      : "bg-background/60 border-border"
                  }`}
                >
                  <span className="text-xl shrink-0">{row.module.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{row.module.name}</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {mandatory
                        ? "Toujours activé"
                        : row.enabled
                        ? "Activé"
                        : "Désactivé · données préservées"}
                    </div>
                  </div>
                  <Toggle
                    enabled={row.enabled}
                    disabled={mandatory || isBusy}
                    onChange={(next) => handleToggle(row, next)}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-border text-[11px] text-muted">
          Désactiver un module cache l&apos;onglet mais conserve toutes ses données.
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, portalContainer);
}

function Toggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
        enabled ? "bg-accent" : "bg-border"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          enabled ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
