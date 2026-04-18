"use client";

import { useEffect, useState } from "react";

// Hook générique pour lire/écrire une valeur localStorage SSR-safe.
// Centralise le pattern "hydrate depuis localStorage au mount si valeur valide".
// Remplace les `eslint-disable-next-line react-hooks/set-state-in-effect` dupliqués.

export function useHydratedLocalStorage<T extends string>(
  key: string,
  initial: T,
  isValid: (raw: string) => raw is T
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved && isValid(saved)) {
      setValue(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function update(next: T) {
    setValue(next);
    window.localStorage.setItem(key, next);
  }

  return [value, update];
}

export function isChapterMode(raw: string): raw is "beginner" | "intermediate" {
  return raw === "beginner" || raw === "intermediate";
}
