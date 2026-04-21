import type { SchemaPayload } from "@/app/project/[id]/atelier/types";

// Génère un thumbnail SVG compact (viewBox 100x75) à partir de nodes/edges.
// Retourne null si le schéma est vide.
// Renvoie du SVG inline (pas de data URL) pour être stocké dans `schemas.thumbnail`
// et servi directement via dangerouslySetInnerHTML (safe car généré côté app).

const NODE_COLOR_BY_TYPE: Record<string, string> = {
  root: "#C9956B",
  branch: "#5b8cff",
  leaf: "#6ecf7a",
  default: "#8b8fa5",
};

export function buildThumbnailSvg(data: SchemaPayload): string | null {
  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  if (nodes.length === 0) return null;

  // Bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + 120);
    maxY = Math.max(maxY, n.position.y + 40);
  }
  if (!Number.isFinite(minX)) return null;

  const padding = 40;
  const spanX = Math.max(1, maxX - minX + padding * 2);
  const spanY = Math.max(1, maxY - minY + padding * 2);

  // Project into 100x75 viewBox preserving aspect
  const scale = Math.min(100 / spanX, 75 / spanY);
  const offsetX = (100 - spanX * scale) / 2;
  const offsetY = (75 - spanY * scale) / 2;

  function project(x: number, y: number) {
    return {
      x: offsetX + (x - minX + padding) * scale,
      y: offsetY + (y - minY + padding) * scale,
    };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const edgeEls = edges
    .map((e) => {
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) return "";
      const p1 = project(a.position.x + 60, a.position.y + 20);
      const p2 = project(b.position.x + 60, b.position.y + 20);
      return `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="#c9a876" stroke-width="0.6" opacity="0.8"/>`;
    })
    .join("");

  const nodeEls = nodes
    .map((n) => {
      const color = NODE_COLOR_BY_TYPE[n.data.nodeType] ?? NODE_COLOR_BY_TYPE.default;
      const p = project(n.position.x, n.position.y);
      const w = 120 * scale;
      const h = 40 * scale;
      return `<rect x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="2.5" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="0.7"/>`;
    })
    .join("");

  return `<svg viewBox="0 0 100 75" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${edgeEls}${nodeEls}</svg>`;
}
