import type { AdaptivityState } from "./state";

export type Severity = "ok" | "warn" | "error";

export type IssueBlock =
  | "breakpoints"
  | "color"
  | "density"
  | "input"
  | "container"
  | "locale"
  | "viewport";

export interface AdaptivityIssue {
  id: string;
  severity: Severity;
  block: IssueBlock;
  message: string;
}

export function validateBreakpoints(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  if (state.breakpoints.length === 0) return out;

  const hasMobile = state.breakpoints.some((b) => b.kind === "mobile");
  if (!hasMobile) {
    out.push({
      id: "bp-no-mobile",
      severity: "error",
      block: "breakpoints",
      message: "Aucun breakpoint mobile — Mobile First cassé (> 50% trafic mobile).",
    });
  }

  // Détection overlap
  const sorted = [...state.breakpoints].sort((a, b) => a.minPx - b.minPx);
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const nextBp = sorted[i + 1];
    if (curr.maxPx !== 0 && nextBp.minPx <= curr.maxPx) {
      out.push({
        id: `bp-overlap-${curr.id}`,
        severity: "warn",
        block: "breakpoints",
        message: `« ${curr.name} » et « ${nextBp.name} » se chevauchent (${curr.maxPx} ≥ ${nextBp.minPx}).`,
      });
    }
  }

  // Gap
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const nextBp = sorted[i + 1];
    if (curr.maxPx !== 0 && nextBp.minPx - curr.maxPx > 1) {
      out.push({
        id: `bp-gap-${curr.id}`,
        severity: "warn",
        block: "breakpoints",
        message: `Gap entre « ${curr.name} » (fin ${curr.maxPx}) et « ${nextBp.name} » (début ${nextBp.minPx}).`,
      });
    }
  }

  return out;
}

export function validateColorSchemes(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  if (state.colorSchemes.length === 0) return out;

  const enabled = state.colorSchemes.filter((c) => c.enabled);
  const hasLight = enabled.some((c) => c.scheme === "light");
  const hasDark = enabled.some((c) => c.scheme === "dark");

  if (!hasLight && !hasDark) {
    out.push({
      id: "cs-no-scheme",
      severity: "warn",
      block: "color",
      message: "Aucun scheme light ou dark activé.",
    });
  }

  if (hasDark && !hasLight) {
    out.push({
      id: "cs-dark-only",
      severity: "warn",
      block: "color",
      message: "Seulement dark activé — prévoir aussi light pour users préférant clair.",
    });
  }

  const darkEntry = state.colorSchemes.find((c) => c.scheme === "dark");
  if (darkEntry?.enabled && darkEntry.tokensMapped === 0) {
    out.push({
      id: "cs-dark-no-tokens",
      severity: "warn",
      block: "color",
      message: "Dark activé mais 0 tokens mappés — aucune couleur n'a de variante sombre.",
    });
  }

  return out;
}

export function validateDensities(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  for (const d of state.densities) {
    if (d.baseFontPx < 14) {
      out.push({
        id: `den-font-too-small-${d.id}`,
        severity: "warn",
        block: "density",
        message: `« ${d.density} » : font ${d.baseFontPx}px, < 14px = trop petit (WCAG 1.4.4 implique zoom 200%).`,
      });
    }
    if (d.lineHeight < 1.4) {
      out.push({
        id: `den-lh-low-${d.id}`,
        severity: "warn",
        block: "density",
        message: `« ${d.density} » : line-height ${d.lineHeight} < 1.4 · WCAG 1.4.12 recommande 1.5.`,
      });
    }
    if (d.targetMinPx < 24) {
      out.push({
        id: `den-target-too-small-${d.id}`,
        severity: "error",
        block: "density",
        message: `« ${d.density} » : target ${d.targetMinPx}px < 24 · WCAG 2.5.8 bloquant.`,
      });
    }
  }
  return out;
}

export function validateInputModalities(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  if (state.inputModalities.length === 0) return out;

  const supported = state.inputModalities.filter((i) => i.supported);

  const hasTouch = supported.some((i) => i.input === "touch");
  const hasKeyboard = supported.some((i) => i.input === "keyboard");

  if (!hasKeyboard) {
    out.push({
      id: "im-no-keyboard",
      severity: "error",
      block: "input",
      message: "Clavier non supporté — WCAG 2.1.1 bloquant.",
    });
  }

  if (!hasTouch) {
    out.push({
      id: "im-no-touch",
      severity: "warn",
      block: "input",
      message: "Touch non supporté — mobile/tablet exclus (majorité du trafic web).",
    });
  }

  for (const m of state.inputModalities) {
    if (m.supported && m.input === "touch" && m.minTargetPx < 24) {
      out.push({
        id: `im-touch-small-${m.id}`,
        severity: "error",
        block: "input",
        message: `Touch : min target ${m.minTargetPx}px < 24 · WCAG 2.5.8 bloquant.`,
      });
    }
  }
  return out;
}

export function validateContainerQueries(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  for (const cq of state.containerQueries) {
    if (!cq.component.trim()) {
      out.push({
        id: `cq-no-component-${cq.id}`,
        severity: "warn",
        block: "container",
        message: "Container query sans composant renseigné.",
      });
    }
    if (!cq.layoutChange.trim()) {
      out.push({
        id: `cq-no-change-${cq.id}`,
        severity: "warn",
        block: "container",
        message: `« ${cq.component || "(sans)"} » : décris le changement de layout attendu.`,
      });
    }
    if (cq.thresholdPx < 50) {
      out.push({
        id: `cq-low-${cq.id}`,
        severity: "warn",
        block: "container",
        message: `« ${cq.component || "(sans)"} » : threshold ${cq.thresholdPx}px très bas · rarement utile.`,
      });
    }
  }
  return out;
}

export function validateLocalizations(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  if (state.localizations.length === 0) return out;
  const enabled = state.localizations.filter((l) => l.enabled);
  if (enabled.length === 0) {
    out.push({
      id: "loc-none-enabled",
      severity: "warn",
      block: "locale",
      message: "Aucune locale activée — i18n inutile tant qu'aucune n'est active.",
    });
  }
  const hasRtl = enabled.some((l) => l.direction === "rtl");
  const hasLtr = enabled.some((l) => l.direction === "ltr");
  if (hasRtl && !hasLtr) {
    out.push({
      id: "loc-rtl-only",
      severity: "warn",
      block: "locale",
      message: "Seulement RTL activé — conserve une LTR de référence.",
    });
  }
  for (const l of state.localizations) {
    if (l.enabled && !l.dateFormat.trim()) {
      out.push({
        id: `loc-no-date-${l.id}`,
        severity: "warn",
        block: "locale",
        message: `« ${l.locale} » : format date manquant.`,
      });
    }
  }
  return out;
}

export function validateViewport(state: AdaptivityState): AdaptivityIssue[] {
  const out: AdaptivityIssue[] = [];
  const zoom200 = state.viewportRules.find((v) => v.axis === "zoom-200");
  if (zoom200 && !zoom200.respected) {
    out.push({
      id: "vp-no-zoom-200",
      severity: "error",
      block: "viewport",
      message: "Zoom 200% non respecté — WCAG 1.4.4 AA bloquant.",
    });
  }
  const reflow = state.viewportRules.find((v) => v.axis === "zoom-400-reflow");
  if (reflow && !reflow.respected) {
    out.push({
      id: "vp-no-reflow",
      severity: "error",
      block: "viewport",
      message: "Reflow 400% non respecté — WCAG 1.4.10 AA bloquant.",
    });
  }
  return out;
}

export function validateAdaptivity(state: AdaptivityState): AdaptivityIssue[] {
  return [
    ...validateBreakpoints(state),
    ...validateColorSchemes(state),
    ...validateDensities(state),
    ...validateInputModalities(state),
    ...validateContainerQueries(state),
    ...validateLocalizations(state),
    ...validateViewport(state),
  ];
}
