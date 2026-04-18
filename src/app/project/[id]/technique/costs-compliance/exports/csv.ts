import type { CostsState } from "../state";

// Export CSV des coûts @ N users — utile pour comptable / investor pitch.
export function exportCostsCsv(state: CostsState): string {
  const lines: string[] = [];
  lines.push("Service,At1User,At100Users,At1kUsers,At10kUsers,At100kUsers");
  for (const c of state.costs) {
    if (!c.service.trim()) continue;
    lines.push([
      escapeCsv(c.service),
      c.at1 || "0",
      c.at100 || "0",
      c.at1k || "0",
      c.at10k || "0",
      c.at100k || "0",
    ].join(","));
  }
  const totals = {
    at1: state.costs.reduce((s, c) => s + (Number(c.at1) || 0), 0),
    at100: state.costs.reduce((s, c) => s + (Number(c.at100) || 0), 0),
    at1k: state.costs.reduce((s, c) => s + (Number(c.at1k) || 0), 0),
    at10k: state.costs.reduce((s, c) => s + (Number(c.at10k) || 0), 0),
    at100k: state.costs.reduce((s, c) => s + (Number(c.at100k) || 0), 0),
  };
  lines.push(`Total,${totals.at1},${totals.at100},${totals.at1k},${totals.at10k},${totals.at100k}`);
  return lines.join("\n");
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
