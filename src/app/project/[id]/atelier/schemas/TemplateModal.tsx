"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SCHEMA_TEMPLATES, type SchemaTemplate } from "../types";

type Props = {
  onClose: () => void;
  onPick: (template: SchemaTemplate) => void;
};

export default function TemplateModal({ onClose, onPick }: Props) {
  const [portalRoot] = useState<HTMLElement | null>(() =>
    typeof document === "undefined"
      ? null
      : document.getElementById("modal-root")
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!portalRoot) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choisir un template"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Choisis un template</h2>
            <p className="text-xs text-muted mt-0.5">
              Point de départ pour ton schéma — modifiable après création.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-background/60 shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCHEMA_TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onPick(t.value)}
              className="text-left p-4 rounded-xl bg-background/40 border border-border hover:border-accent/60 hover:bg-accent/10 transition-colors"
            >
              <div className="text-3xl mb-2">{t.emoji}</div>
              <div className="font-semibold text-sm mb-1">{t.label}</div>
              <div className="text-xs text-muted leading-relaxed">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(content, portalRoot);
}
