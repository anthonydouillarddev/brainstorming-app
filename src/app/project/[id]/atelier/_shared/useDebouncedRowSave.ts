"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Options<T> = {
  table: "notes" | "schemas";
  id: string | null;
  delayMs?: number;
  flushOnUnmount?: boolean;
  onError?: (message: string) => void;
  onSaved?: (patch: Partial<T>) => void;
};

type Result<T> = {
  save: (patch: Partial<T>) => void;
  saveNow: (patch: Partial<T>) => Promise<void>;
  saving: boolean;
  lastSaved: string | null;
  saveError: string | null;
  clearError: () => void;
};

// Hook de sauvegarde debounced sur une ligne d'une table Supabase (notes | schemas).
// Pattern calqué sur useChapterPersistence mais opère par `update().eq('id', ...)` plutôt
// qu'upsert sur `sections`. Aggrège les patchs successifs en un seul UPDATE par fenêtre.
export function useDebouncedRowSave<T extends object>({
  table,
  id,
  delayMs = 2000,
  flushOnUnmount = true,
  onError,
  onSaved,
}: Options<T>): Result<T> {
  const supabase = createClient();
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Partial<T>>({});
  // Snapshot l'id dans une ref pour pouvoir flusher après unmount.
  const idRef = useRef(id);
  idRef.current = id;
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const flush = useCallback(async () => {
    if (!id) return;
    const patch = pendingRef.current;
    if (Object.keys(patch).length === 0) return;
    pendingRef.current = {};
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase
      .from(table)
      .update(patch as Record<string, unknown>)
      .eq("id", id);
    if (!mountedRef.current) return;
    setSaving(false);
    if (error) {
      const message = error.message || "Erreur de sauvegarde";
      setSaveError(message);
      onError?.(message);
      return;
    }
    setLastSaved(
      new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
    onSaved?.(patch);
  }, [id, table, supabase, onError, onSaved]);

  const save = useCallback(
    (patch: Partial<T>) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    [flush, delayMs]
  );

  const saveNow = useCallback(
    async (patch: Partial<T>) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      await flush();
    },
    [flush]
  );

  const clearError = useCallback(() => setSaveError(null), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Flush pending changes directement vers Supabase (sans setState, le composant
      // est unmount). L'user a saisi → on ne veut pas perdre ses 2 dernières secondes.
      if (flushOnUnmount) {
        const pending = pendingRef.current;
        const pendingId = idRef.current;
        if (pendingId && Object.keys(pending).length > 0) {
          pendingRef.current = {};
          void supabase
            .from(table)
            .update(pending as Record<string, unknown>)
            .eq("id", pendingId);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { save, saveNow, saving, lastSaved, saveError, clearError };
}
