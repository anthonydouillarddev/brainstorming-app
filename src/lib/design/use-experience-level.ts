"use client";

import { useEffect, useState } from "react";
import type { ExperienceLevel } from "@/lib/types";
import { EXPERIENCE_EVENT, EXPERIENCE_STORAGE_KEY } from "./gating";

const VALID: ReadonlySet<ExperienceLevel> = new Set([
  "beginner",
  "intermediate",
  "expert",
]);

function readStored(): ExperienceLevel | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);
  if (raw && VALID.has(raw as ExperienceLevel)) return raw as ExperienceLevel;
  return null;
}

// Hook client : lit localStorage + écoute l'event mindeck:experience-changed.
// Initial = fallback fourni par le parent (SSR-safe), hydraté depuis localStorage au mount.
export function useExperienceLevel(initial: ExperienceLevel = "intermediate"): ExperienceLevel {
  const [level, setLevel] = useState<ExperienceLevel>(initial);

  useEffect(() => {
    const stored = readStored();
    if (stored && stored !== level) {
      setLevel(stored);
    }
    function handler(e: Event) {
      const next = (e as CustomEvent<{ level: ExperienceLevel }>).detail?.level;
      if (next && VALID.has(next)) setLevel(next);
    }
    window.addEventListener(EXPERIENCE_EVENT, handler);
    return () => window.removeEventListener(EXPERIENCE_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return level;
}
