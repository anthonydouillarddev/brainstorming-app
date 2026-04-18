"use client";

import type { FrontendState, TypeValidation } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const VALIDATIONS: { value: TypeValidation; label: string; hint: string }[] = [
  { value: "zod", label: "Zod", hint: "16M weekly, default 2026. Bundle 26KB." },
  { value: "valibot", label: "Valibot", hint: "Plus léger (4KB), API plus verbeuse." },
  { value: "yup", label: "Yup", hint: "Legacy, préfère Zod." },
  { value: "none", label: "Aucune", hint: "⚠️ Pas de validation runtime." },
];

export default function TypeScriptBlock({
  state,
  onChange,
}: {
  state: FrontendState;
  onChange: (patch: Partial<FrontendState>) => void;
}) {
  const filled =
    (state.tsStrict ? 1 : 0) + (state.validation ? 1 : 0);

  return (
    <CollapsibleSection
      emoji="📐"
      title="TypeScript & Validation"
      description="TS strict obligatoire Mindeck (0 any). Validation runtime aux frontières API."
      filled={filled}
      total={2}
      storageKey="mindeck:technique:frontend:typescript:open"
    >
      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input
          type="checkbox"
          checked={state.tsStrict}
          onChange={(e) => onChange({ tsStrict: e.target.checked })}
          className="h-4 w-4 rounded border-border mt-0.5"
        />
        <div>
          <div className="text-xs font-semibold">TypeScript strict</div>
          <div className="text-[11px] text-muted">
            `tsconfig.json` strict: true · noImplicitAny · noUncheckedIndexedAccess
          </div>
        </div>
      </label>

      <div>
        <div className="text-xs font-semibold mb-2">Validation runtime</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {VALIDATIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => onChange({ validation: v.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.validation === v.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{v.label}</div>
              <div className="text-[11px] text-muted">{v.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={state.useTrpc}
          onChange={(e) => onChange({ useTrpc: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <span>Utilise tRPC pour type-safety client↔serveur</span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <input
          type="text"
          value={state.validationNotes}
          onChange={(e) => onChange({ validationNotes: e.target.value })}
          placeholder="Ex: Zod schemas partagés client/server via @/lib/schemas"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </CollapsibleSection>
  );
}
