"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const HELP_CONTENT: Record<string, { title: string; body: ReactNode }> = {
  oklch: {
    title: "OKLCH (Lightness, Chroma, Hue)",
    body: (
      <>
        <p>
          OKLCH est un format couleur moderne qui mesure la <strong>lightness perceptuelle</strong>
          (comment ton œil perçoit la luminosité), pas mathématique comme HSL.
        </p>
        <p>
          <strong>Pourquoi c&apos;est mieux que HSL ?</strong> Un jaune et un bleu HSL avec la même
          lightness ne paraissent PAS aussi clairs (le jaune semble plus vif). OKLCH corrige ça →
          dégradés et inversions dark mode propres.
        </p>
        <p>Standard 2024-2026, supporté Chrome/Safari/Firefox depuis 2023.</p>
      </>
    ),
  },
  shade: {
    title: "Qu&apos;est-ce qu&apos;une shade ?",
    body: (
      <>
        <p>
          Une <strong>shade</strong> = une variation d&apos;une couleur (50, 100, 200, ..., 950).
          Au lieu d&apos;avoir 1 seule couleur primary, tu as 12 variantes pour chaque usage :
        </p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>50-100 : fond très clair (banner info)</li>
          <li>200-300 : bordures, hover</li>
          <li>500-600 : couleur brand (boutons)</li>
          <li>700-900 : texte coloré</li>
          <li>950 : texte très dense</li>
        </ul>
      </>
    ),
  },
  wcag: {
    title: "Contraste WCAG",
    body: (
      <>
        <p>
          WCAG (Web Content Accessibility Guidelines) définit les niveaux de contraste minimum pour
          que ton texte soit lisible :
        </p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>
            <strong>≥ 4.5:1</strong> = AA (texte normal lisible)
          </li>
          <li>
            <strong>≥ 3:1</strong> = AA Large (titres, UI elements)
          </li>
          <li>
            <strong>≥ 7:1</strong> = AAA (idéal pour basse vision)
          </li>
        </ul>
        <p>Obligatoire en UE depuis juin 2025 (European Accessibility Act).</p>
      </>
    ),
  },
  ratio: {
    title: "Ratio modulaire (typo)",
    body: (
      <>
        <p>
          Une <strong>échelle modulaire</strong> est une formule mathématique qui produit des
          tailles harmonieuses. Au lieu de choisir au pif (12, 14, 16, 22, 30), on multiplie une
          base par un ratio (16 × 1.25 = 20 × 1.25 = 25...).
        </p>
        <p>Comme les notes de musique : tout s&apos;enchaîne. Ton app paraît instantanément pro.</p>
      </>
    ),
  },
  density: {
    title: "Densité d&apos;affichage",
    body: (
      <>
        <p>Multiplie tous les espacements et tailles de control :</p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>
            <strong>Compact (×0.85)</strong> : power users (Linear, Notion)
          </li>
          <li>
            <strong>Normal (×1)</strong> : équilibré
          </li>
          <li>
            <strong>Comfortable (×1.15)</strong> : plus aéré, pour grand public ou seniors
          </li>
        </ul>
      </>
    ),
  },
  radius: {
    title: "Border radius",
    body: (
      <>
        <p>L&apos;arrondi des coins. Définit la personnalité de ton UI :</p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>0-4px : sec, brutalist</li>
          <li>8-12px : moderne (la majorité des apps en 2025)</li>
          <li>16-24px : doux, friendly</li>
          <li>full : pilule, super playful</li>
        </ul>
      </>
    ),
  },
  shadow: {
    title: "Élévation (shadow)",
    body: (
      <>
        <p>
          Les ombres simulent la <strong>profondeur</strong>. Convention :
        </p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>
            <strong>sm</strong> : boutons, inputs au repos
          </li>
          <li>
            <strong>md</strong> : cards posées
          </li>
          <li>
            <strong>lg</strong> : cards élevées (hover)
          </li>
          <li>
            <strong>xl</strong> : modals, popovers
          </li>
        </ul>
        <p>
          Dans le dark mode, les ombres ne se voient plus → on utilise une teinte de surface plus
          claire à la place (Material 3).
        </p>
      </>
    ),
  },
  neutral: {
    title: "Gris teinté",
    body: (
      <>
        <p>
          Le gris pur (#808080) est <strong>mort</strong>. Les designs premium utilisent des gris
          avec une légère teinte de la couleur primary (cool gray, warm gray).
        </p>
        <p>
          Pourquoi ? Cohérence visuelle : ton texte gris a une touche imperceptible qui s&apos;harmonise
          avec ta marque. Linear, Stripe, Apple font tous ça.
        </p>
      </>
    ),
  },
  semantic: {
    title: "Couleurs sémantiques",
    body: (
      <>
        <p>
          Ce sont les <strong>couleurs des états</strong> : success (vert), warning (ambre), error
          (rouge), info (bleu).
        </p>
        <p>
          Standardisées partout (l&apos;user a appris ces conventions depuis 30 ans). Inutile
          d&apos;être créatif ici — utilise les hues canoniques pour ne pas perdre l&apos;user.
        </p>
      </>
    ),
  },
  fontPairing: {
    title: "Font pairing",
    body: (
      <>
        <p>Choix de polices. 3 stratégies courantes :</p>
        <ul className="list-disc pl-4 mt-1 space-y-0.5">
          <li>
            <strong>Mono-typeface</strong> : 1 seule font (Linear, Vercel)
          </li>
          <li>
            <strong>Serif + Sans</strong> : serif pour titres + sans pour body (éditorial)
          </li>
          <li>
            <strong>Sans + Mono</strong> : sans pour UI + mono pour code
          </li>
        </ul>
        <p>Max 2 polices différentes pour éviter le chaos visuel.</p>
      </>
    ),
  },
  marriage: {
    title: "Mariage de couleurs",
    body: (
      <>
        <p>
          Test crucial : voir comment tes couleurs choisies se marient ensemble dans une UI réelle
          (pas juste isolément).
        </p>
        <p>
          Les rôles (Background, Text, Accent, Secondary) suivent la <strong>position dans la
          liste</strong>. Réorganise avec ◀ ▶ pour changer les attributions.
        </p>
      </>
    ),
  },
  darkPerceptual: {
    title: "Dark mode perceptuel OKLCH",
    body: (
      <>
        <p>
          Au lieu d&apos;inverser bêtement les couleurs (RGB → 255 - r), on inverse la lightness
          OKLCH de manière <strong>asymétrique</strong> : les lights deviennent darks et inverse,
          mais avec des courbes ajustées.
        </p>
        <p>
          On réduit aussi la chroma de ~15% car les couleurs très saturées en dark mode fatiguent
          les yeux.
        </p>
        <p>C&apos;est ce que font Material 3 et Apple HIG.</p>
      </>
    ),
  },
};

export type HelpKey = keyof typeof HELP_CONTENT;

export function Help({ topic, inline = false }: { topic: HelpKey; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const content = HELP_CONTENT[topic];

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!content) return null;

  return (
    <span className={inline ? "inline-block relative" : "relative inline-block"} ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center w-4 h-4 ml-1 rounded-full bg-muted/20 text-muted hover:bg-accent hover:text-white text-[10px] font-bold transition align-middle"
        title={`En savoir plus sur ${content.title}`}
        aria-label={`Aide : ${content.title}`}
      >
        ?
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-lg p-3 shadow-2xl z-50 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{content.title}</h4>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground w-5 h-5 flex items-center justify-center rounded hover:bg-accent/10"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <div className="text-muted leading-relaxed space-y-2">{content.body}</div>
        </div>
      )}
    </span>
  );
}
