"use client";

import {
  SERVICES_CATALOG,
  SERVICE_GROUP_META,
  SERVICE_SCORE_META,
  type ServiceGroup,
  type ProjectType as ServiceProjectType,
} from "@/lib/technique/services-catalog";
import type { CategorySelection, CategoryStatus, ServicesState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const STATUSES: { value: CategoryStatus; label: string; emoji: string }[] = [
  { value: "todo", label: "À décider", emoji: "⏳" },
  { value: "evaluated", label: "Évalué", emoji: "🔎" },
  { value: "used", label: "Utilisé", emoji: "✅" },
  { value: "skip", label: "Pas besoin", emoji: "➖" },
];

export default function CatalogBlock({
  state,
  onChange,
  projectType,
}: {
  state: ServicesState;
  onChange: (patch: Partial<ServicesState>) => void;
  projectType: ServiceProjectType;
}) {
  const categories = state.filterByProjectType
    ? SERVICES_CATALOG.filter((c) => c.fitFor.includes(projectType))
    : SERVICES_CATALOG;

  const groupedEntries: [ServiceGroup, typeof SERVICES_CATALOG][] = (
    Object.keys(SERVICE_GROUP_META) as ServiceGroup[]
  ).map((g) => [g, categories.filter((c) => c.group === g)]);

  function updateSelection(categoryId: string, patch: Partial<CategorySelection>) {
    const next = state.selections.map((s) =>
      s.categoryId === categoryId ? { ...s, ...patch } : s
    );
    onChange({ selections: next });
  }

  return (
    <div className="space-y-5">
      <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs">
          <span className="font-semibold">{categories.length}</span> catégories affichées sur{" "}
          <span className="font-semibold">{SERVICES_CATALOG.length}</span>.
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={state.filterByProjectType}
            onChange={(e) => onChange({ filterByProjectType: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          <span>Filtrer selon le type projet ({projectType})</span>
        </label>
      </section>

      {groupedEntries.map(([group, cats]) => {
        if (cats.length === 0) return null;
        const meta = SERVICE_GROUP_META[group];
        const used = cats.filter((c) => {
          const sel = state.selections.find((s) => s.categoryId === c.id);
          return sel?.status === "used";
        }).length;
        const decided = cats.filter((c) => {
          const sel = state.selections.find((s) => s.categoryId === c.id);
          return sel?.status === "used" || sel?.status === "skip";
        }).length;
        return (
          <CollapsibleSection
            key={group}
            emoji={meta.emoji}
            title={meta.label}
            description={`${used} utilisé(s) · ${decided}/${cats.length} décidés`}
            filled={decided}
            total={cats.length}
            storageKey={`mindeck:technique:services:${group}:open`}
          >
            <div className="space-y-2">
              {cats.map((c) => {
                const sel = state.selections.find((s) => s.categoryId === c.id);
                if (!sel) return null;
                const options = [c.recommended, ...c.alternatives];
                return (
                  <div
                    key={c.id}
                    className="bg-background/60 border border-border rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{c.label}</div>
                        <div className="text-[11px] text-muted">{c.hint}</div>
                      </div>
                      <select
                        value={sel.status}
                        onChange={(e) =>
                          updateSelection(c.id, {
                            status: e.target.value as CategoryStatus,
                          })
                        }
                        className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.emoji} {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {sel.status !== "skip" && (
                      <>
                        <div className="flex flex-wrap gap-1">
                          {options.map((o) => (
                            <button
                              key={o.name}
                              type="button"
                              onClick={() =>
                                updateSelection(c.id, { selectedService: o.name })
                              }
                              className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                                sel.selectedService === o.name
                                  ? "bg-accent/15 border-accent text-accent"
                                  : "bg-card border-border text-muted hover:text-foreground"
                              }`}
                              title={o.note ?? ""}
                            >
                              {SERVICE_SCORE_META[o.score].emoji} {o.name}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={sel.notes}
                          onChange={(e) =>
                            updateSelection(c.id, { notes: e.target.value })
                          }
                          placeholder="Notes (pricing, compte, limites…)"
                          className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
