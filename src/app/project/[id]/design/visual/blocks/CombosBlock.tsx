"use client";

import { useEffect, useMemo, useState } from "react";
import { COLOR_COMBOS, COMBO_STYLES, type ColorCombo } from "@/lib/design/combos";
import {
  fetchCustomCombos,
  createCustomCombo,
  deleteCustomComboById,
  type CustomComboRow,
} from "@/lib/design/colors-api";
import ComboCard from "../components/ComboCard";
import { parseHexList } from "../components/shared";

function rowToCombo(row: CustomComboRow): ColorCombo {
  return {
    id: row.id,
    name: row.name,
    style: row.style,
    colors: row.colors,
    note: row.note ?? undefined,
  };
}

export default function CombosBlock({
  onPickColor,
  onLoadCombo,
}: {
  onPickColor: (hex: string, comboId: string, index: number, comboName: string) => void;
  onLoadCombo: (combo: ColorCombo) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [styleFilter, setStyleFilter] = useState<ColorCombo["style"] | "all">("all");
  const [customCombos, setCustomCombos] = useState<ColorCombo[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [directName, setDirectName] = useState("");
  const [directHex, setDirectHex] = useState("");
  const [directStyle, setDirectStyle] = useState<ColorCombo["style"]>("custom");
  const [directError, setDirectError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const combos = await fetchCustomCombos();
      if (!cancelled) setCustomCombos(combos.map(rowToCombo));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allCombos = useMemo(() => [...customCombos, ...COLOR_COMBOS], [customCombos]);
  const filtered =
    styleFilter === "all" ? allCombos : allCombos.filter((c) => c.style === styleFilter);
  const customIds = useMemo(() => new Set(customCombos.map((c) => c.id)), [customCombos]);

  async function handleDirectCreate() {
    const name = directName.trim();
    if (!name) {
      setDirectError("Donne un nom à ton combo.");
      return;
    }
    const colors = parseHexList(directHex);
    if (colors.length < 2) {
      setDirectError("Entre au moins 2 couleurs hex valides (#RRGGBB).");
      return;
    }
    setDirectError(null);
    const row = await createCustomCombo({
      name,
      colors,
      style: directStyle,
      note: "Créé depuis un import direct",
    });
    if (row) {
      setCustomCombos((prev) => [rowToCombo(row), ...prev]);
      setDirectName("");
      setDirectHex("");
      setDirectStyle("custom");
      setCreateOpen(false);
    }
  }

  async function handleDelete(id: string) {
    const prev = customCombos;
    setCustomCombos(prev.filter((c) => c.id !== id));
    try {
      await deleteCustomComboById(id);
    } catch {
      setCustomCombos(prev);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
          aria-label={collapsed ? "Déplier" : "Replier"}
        >
          {collapsed ? "▶" : "▼"}
          3. Combos inspirationnels
          <span className="text-muted font-normal text-sm">
            ({COLOR_COMBOS.length + customCombos.length})
          </span>
        </button>
        {!collapsed && (
          <button
            onClick={() => setCreateOpen((v) => !v)}
            className="text-sm px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
          >
            {createOpen ? "Annuler" : "➕ Créer un combo"}
          </button>
        )}
      </div>

      {collapsed && !createOpen && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Afficher les {COLOR_COMBOS.length + customCombos.length} combos
        </button>
      )}

      {!collapsed && (
        <>
          {createOpen && (
            <div className="bg-card/80 border border-accent/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-sm">Créer un combo perso (import direct)</h3>
              <p className="text-xs text-muted">
                Colle les codes hex (séparés par virgules, espaces, ou retours à la ligne).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nom *</label>
                  <input
                    type="text"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="Ex : Mon combo TikTok"
                    className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Style</label>
                  <select
                    value={directStyle}
                    onChange={(e) => setDirectStyle(e.target.value as ColorCombo["style"])}
                    className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                  >
                    {COMBO_STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.emoji} {s.label}
                      </option>
                    ))}
                    <option value="custom">🎨 Custom</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Couleurs (au moins 2 hex) *</label>
                <textarea
                  value={directHex}
                  onChange={(e) => setDirectHex(e.target.value)}
                  placeholder="#111827, #ff6b5b"
                  rows={3}
                  className="w-full px-3 py-2 text-sm font-mono rounded border border-border bg-card"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {parseHexList(directHex).map((hex) => (
                    <div
                      key={hex}
                      className="flex items-center gap-1 text-[11px] font-mono border border-border rounded-full px-2 py-0.5"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ background: hex }}
                      />
                      {hex}
                    </div>
                  ))}
                </div>
              </div>
              {directError && <p className="text-xs text-red-500">{directError}</p>}
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setCreateOpen(false)}
                  className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDirectCreate}
                  className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition"
                >
                  Sauver le combo
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStyleFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                styleFilter === "all"
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              Tous
            </button>
            {COMBO_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyleFilter(s.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  styleFilter === s.value
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((combo) => (
              <div key={combo.id} className="relative">
                {customIds.has(combo.id) && (
                  <>
                    <button
                      onClick={() => handleDelete(combo.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs hover:bg-red-500"
                      title="Supprimer"
                    >
                      ×
                    </button>
                    <span className="absolute top-2 left-2 z-10 text-[10px] bg-accent text-white px-1.5 py-0.5 rounded">
                      Perso
                    </span>
                  </>
                )}
                <ComboCard
                  combo={combo}
                  onPickColor={onPickColor}
                  onLoadAllToPreview={onLoadCombo}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
