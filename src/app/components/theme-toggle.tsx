"use client";

import { useState, useEffect, useCallback } from "react";

export function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}

function readInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(readInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    applyTheme(dark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExternalChange = useCallback((e: Event) => {
    const detail = (e as CustomEvent<{ dark: boolean }>).detail;
    setDark(detail.dark);
  }, []);

  useEffect(() => {
    window.addEventListener("mindeck:theme-changed", handleExternalChange);
    return () => window.removeEventListener("mindeck:theme-changed", handleExternalChange);
  }, [handleExternalChange]);

  function toggle() {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent("mindeck:theme-changed", { detail: { dark: next } }));
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-card border border-border transition-colors"
      title={dark ? "Mode clair" : "Mode sombre"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
