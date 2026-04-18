"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { applyTheme } from "./theme-toggle";
import type {
  UserPreferences,
  Theme,
  DisplayDensity,
  DefaultTaskView,
  ExperienceLevel,
} from "@/lib/types";
import {
  THEMES,
  DISPLAY_DENSITIES,
  DEFAULT_PREFERENCES,
} from "@/lib/types";
import {
  EXPERIENCE_EVENT,
  EXPERIENCE_LEVEL_META,
  EXPERIENCE_LEVELS,
  EXPERIENCE_STORAGE_KEY,
} from "@/lib/design/gating";

type SettingsSection = "profile" | "appearance" | "notifications" | "plan" | "security" | "data";

const NAV_ITEMS: { value: SettingsSection; label: string; icon: string }[] = [
  { value: "profile", label: "Profil", icon: "👤" },
  { value: "appearance", label: "Apparence", icon: "🎨" },
  { value: "notifications", label: "Notifications", icon: "🔔" },
  { value: "plan", label: "Plan", icon: "📊" },
  { value: "security", label: "Sécurité", icon: "🔒" },
  { value: "data", label: "Données", icon: "📤" },
];

function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase();
}

function resolveThemeDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDensity(density: DisplayDensity) {
  const html = document.documentElement;
  html.classList.remove("density-compact", "density-comfortable");
  if (density !== "normal") html.classList.add(`density-${density}`);
  localStorage.setItem("display_density", density);
}

export default function UserSettings({
  userEmail,
  userId,
  initialPreferences,
}: {
  userEmail: string;
  userId: string;
  initialPreferences: UserPreferences | null;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const [section, setSection] = useState<SettingsSection>("profile");

  const [prefs, setPrefs] = useState({
    theme: initialPreferences?.theme ?? DEFAULT_PREFERENCES.theme,
    display_density: initialPreferences?.display_density ?? DEFAULT_PREFERENCES.display_density,
    default_task_view: initialPreferences?.default_task_view ?? DEFAULT_PREFERENCES.default_task_view,
    role: initialPreferences?.role ?? DEFAULT_PREFERENCES.role,
    experience_level:
      initialPreferences?.experience_level ?? DEFAULT_PREFERENCES.experience_level,
  });

  // Profile editing
  const [displayName, setDisplayName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [hasRow, setHasRow] = useState(!!initialPreferences);
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const supabase = createClient();

  // ---- Load display name from Supabase user_metadata ----
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setDisplayName(meta?.full_name ?? meta?.name ?? "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Apply density on mount ----
  useEffect(() => {
    const saved = localStorage.getItem("display_density") as DisplayDensity | null;
    if (saved && ["compact", "normal", "comfortable"].includes(saved)) {
      applyDensity(saved);
      if (saved !== prefs.display_density) {
        setPrefs((p) => ({ ...p, display_density: saved }));
      }
    } else {
      applyDensity(prefs.display_density);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Listen for external theme changes (from ThemeToggle) ----
  useEffect(() => {
    function handleExternal(e: Event) {
      const dark = (e as CustomEvent<{ dark: boolean }>).detail.dark;
      setPrefs((p) => ({ ...p, theme: dark ? "dark" : "light" }));
    }
    window.addEventListener("mindeck:theme-changed", handleExternal);
    return () => window.removeEventListener("mindeck:theme-changed", handleExternal);
  }, []);

  // ---- Escape to close ----
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ---- Refocus trigger button at close (a11y) ----
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  // ---- Portal container ----
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalContainer(document.getElementById("modal-root"));
  }, []);

  // ---- Cleanup timers ----
  useEffect(() => {
    const timers = saveTimers.current;
    return () => { Object.values(timers).forEach(clearTimeout); };
  }, []);

  // ---- Debounced save to DB ----
  const savePreference = useCallback(
    (key: string, value: string) => {
      clearTimeout(saveTimers.current[key]);
      saveTimers.current[key] = setTimeout(async () => {
        if (!hasRow) {
          const { error } = await supabase
            .from("user_preferences")
            .insert({ user_id: userId, [key]: value });
          if (!error) setHasRow(true);
        } else {
          await supabase
            .from("user_preferences")
            .update({ [key]: value, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
        }
      }, 600);
    },
    [hasRow, supabase, userId]
  );

  function updateTheme(theme: Theme) {
    setPrefs((p) => ({ ...p, theme }));
    const dark = resolveThemeDark(theme);
    applyTheme(dark);
    window.dispatchEvent(new CustomEvent("mindeck:theme-changed", { detail: { dark } }));
    savePreference("theme", theme);
  }

  function updateDensity(density: DisplayDensity) {
    setPrefs((p) => ({ ...p, display_density: density }));
    applyDensity(density);
    savePreference("display_density", density);
  }

  function updateTaskView(view: DefaultTaskView) {
    setPrefs((p) => ({ ...p, default_task_view: view }));
    savePreference("default_task_view", view);
  }

  function updateExperience(level: ExperienceLevel) {
    setPrefs((p) => ({ ...p, experience_level: level }));
    if (typeof window !== "undefined") {
      localStorage.setItem(EXPERIENCE_STORAGE_KEY, level);
      window.dispatchEvent(
        new CustomEvent(EXPERIENCE_EVENT, { detail: { level } })
      );
    }
    savePreference("experience_level", level);
  }

  // ---- Save display name ----
  async function handleSaveName() {
    setNameSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });
    setNameSaving(false);
    if (!error) {
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    }
  }

  // ---- Change password ----
  async function handleChangePassword() {
    setPwMessage(null);
    if (newPassword.length < 6) {
      setPwMessage({ ok: false, text: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ ok: false, text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMessage({ ok: false, text: error.message });
    } else {
      setPwMessage({ ok: true, text: "Mot de passe modifié avec succès." });
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  // ---- Delete account ----
  async function handleDeleteAccount() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    const typed = window.prompt("Pour confirmer, tapez votre adresse email :");
    if (typed?.trim() !== userEmail) {
      setDeleteConfirm(false);
      return;
    }
    await supabase.from("user_preferences").delete().eq("user_id", userId);
    await supabase.from("todos").delete().eq("user_id", userId);
    await supabase.from("dev_items").delete().eq("user_id", userId);
    const { data: projects } = await supabase.from("projects").select("id").eq("user_id", userId);
    if (projects) {
      const ids = projects.map((p: { id: string }) => p.id);
      if (ids.length > 0) {
        await supabase.from("sections").delete().in("project_id", ids);
        await supabase.from("decisions").delete().in("project_id", ids);
        await supabase.from("roadmap_items").delete().in("project_id", ids);
        await supabase.from("risks").delete().in("project_id", ids);
        await supabase.from("todos").delete().in("project_id", ids);
        await supabase.from("projects").delete().in("id", ids);
      }
    }
    window.location.href = "/auth/signout";
  }

  const initials = getInitials(userEmail);

  // ---- Section panels ----
  function renderSection() {
    switch (section) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Profil</h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{displayName || userEmail.split("@")[0]}</p>
                <p className="text-sm text-muted truncate">{userEmail}</p>
              </div>
            </div>

            {/* Nom d'affichage */}
            <div className="bg-background/60 border border-border rounded-xl p-4 space-y-4">
              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1.5">
                  Nom d&apos;affichage
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom..."
                    className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {nameSaving ? "..." : nameSuccess ? "Sauvé !" : "Sauver"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Email</label>
                <p className="text-sm text-muted">{userEmail}</p>
              </div>

              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">Identifiant</label>
                <p className="text-sm font-mono text-muted">{userId.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Apparence</h2>

            <div>
              <label className="text-sm font-medium mb-3 block">Thème</label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => updateTheme(t.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      prefs.theme === t.value
                        ? "border-accent bg-accent/10 text-accent font-medium"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <span className="text-xl block mb-1">
                      {t.icon === "sun" ? "☀️" : t.icon === "moon" ? "🌙" : "💻"}
                    </span>
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Densité d&apos;affichage</label>
              <div className="space-y-2">
                {DISPLAY_DENSITIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => updateDensity(d.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      prefs.display_density === d.value
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{d.label}</span>
                    <span className="text-xs text-muted ml-2">{d.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Vue par défaut des tâches</label>
              <div className="flex gap-2">
                {(["list", "kanban"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => updateTaskView(v)}
                    className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                      prefs.default_task_view === v
                        ? "border-accent bg-accent/10 text-accent font-medium"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    {v === "list" ? "📋 Liste" : "📊 Kanban"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                id="experience-level-label"
                className="text-sm font-medium mb-1 block"
              >
                Niveau d&apos;expertise
              </label>
              <p className="text-xs text-muted mb-3">
                Filtre les chapitres Design affichés. Débutant = 6 essentiels, Intermédiaire/Expert = 12.
              </p>
              <div
                role="radiogroup"
                aria-labelledby="experience-level-label"
                className="space-y-2"
              >
                {EXPERIENCE_LEVELS.map((level) => {
                  const meta = EXPERIENCE_LEVEL_META[level];
                  const isActive = prefs.experience_level === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => updateExperience(level)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                        isActive
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="block text-xs text-muted mt-0.5">{meta.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Notifications</h2>
            <p className="text-sm text-muted">Les notifications seront disponibles prochainement.</p>
            <div className="space-y-3 opacity-50 pointer-events-none">
              {["Email digest", "Rappels deadline", "Alertes blocages"].map((label) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 border border-border rounded-xl">
                  <span className="text-sm">{label}</span>
                  <div className="w-10 h-6 bg-border rounded-full relative">
                    <div className="w-4 h-4 bg-card rounded-full absolute left-1 top-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "plan":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Plan & Abonnement</h2>
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-sm">Solo — Gratuit</p>
                <p className="text-xs text-muted">Accès personnel complet</p>
              </div>
            </div>
            <p className="text-sm text-muted">
              Mindeck est actuellement en accès personnel gratuit. Les plans payants arrivent bientôt.
            </p>
            <div className="bg-background/60 border border-border rounded-xl p-4">
              <label className="text-xs text-muted font-medium uppercase tracking-wider">Rôle</label>
              <p className="text-sm mt-0.5 capitalize">{prefs.role}</p>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Sécurité</h2>

            {/* Modifier le mot de passe */}
            <div className="bg-background/60 border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium">Modifier le mot de passe</h3>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              {pwMessage && (
                <p className={`text-xs ${pwMessage.ok ? "text-green-500" : "text-red-500"}`}>
                  {pwMessage.text}
                </p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !newPassword}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {pwSaving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </div>

            {/* Sessions */}
            <div className="bg-background/60 border border-border rounded-xl p-4">
              <label className="text-xs text-muted font-medium uppercase tracking-wider">Sessions actives</label>
              <p className="text-sm mt-0.5">1 session active — cet appareil</p>
            </div>

            {/* Déconnexion */}
            <div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                >
                  Se déconnecter
                </button>
              </form>
            </div>

            {/* Suppression compte */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-red-500 mb-2">Zone dangereuse</h3>
              <p className="text-xs text-muted mb-3">
                Supprimer votre compte effacera toutes vos données (projets, tâches, décisions...). Cette action est irréversible.
              </p>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-4 py-2.5 bg-red-500/10 text-red-500 text-sm font-semibold rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-red-500 font-medium">
                    Cliquez à nouveau pour confirmer (vous devrez taper votre email).
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Confirmer la suppression
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Données & Export</h2>
            <p className="text-sm text-muted">Export de données bientôt disponible (JSON, CSV).</p>
            <div className="space-y-2 opacity-50 pointer-events-none">
              <button className="w-full text-left px-4 py-3 border border-border rounded-xl text-sm">
                📥 Exporter mes projets (JSON)
              </button>
              <button className="w-full text-left px-4 py-3 border border-border rounded-xl text-sm">
                📥 Exporter mes tâches (CSV)
              </button>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted">Politique de confidentialité — bientôt disponible</p>
            </div>
          </div>
        );
    }
  }

  // ---- Modal via portal ----
  const modal = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: "settings-fade-in 0.15s ease-out" }}
        onClick={() => setOpen(false)}
      />

      {/* Card — fixed height for consistency */}
      <div
        className="relative w-full max-w-3xl h-[min(80vh,640px)] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        style={{ animation: "settings-scale-in 0.15s ease-out" }}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background/60 transition-colors z-10"
        >
          ✕
        </button>

        {/* Sidebar */}
        <nav className="md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-border bg-background/40">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible p-2 md:p-3 gap-1">
            {NAV_ITEMS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSection(s.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                  section === s.value
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-background/60"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Avatar button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
        title="Paramètres"
      >
        {initials}
      </button>

      {/* Render modal in portal to escape stacking contexts */}
      {portalContainer && modal && createPortal(modal, portalContainer)}
    </>
  );
}
