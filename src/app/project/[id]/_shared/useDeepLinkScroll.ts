"use client";

import { useEffect } from "react";

// Scroll + highlight temporaire un élément identifié par un attribut data-{kind}-id.
// Lit searchParams.get("id") à chaque changement et applique l'effet au prochain tick
// (les DOM enfants peuvent n'être pas encore montés, d'où le rAF).
export function useDeepLinkScroll(
  searchParamsId: string | null,
  attr: string
) {
  useEffect(() => {
    if (!searchParamsId) return;
    let cancelled = false;
    const target = searchParamsId;

    // Plusieurs rAF pour laisser le panel se monter (listes virtualisées, kanban, etc.)
    function attempt(remaining: number) {
      if (cancelled) return;
      const el = document.querySelector(
        `[data-${attr}="${CSS.escape(target)}"]`
      );
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("mindeck-deep-link-flash");
        window.setTimeout(() => {
          el.classList.remove("mindeck-deep-link-flash");
        }, 1600);
        return;
      }
      if (remaining > 0) {
        window.requestAnimationFrame(() => attempt(remaining - 1));
      }
    }
    attempt(8);

    return () => {
      cancelled = true;
    };
  }, [searchParamsId, attr]);
}
