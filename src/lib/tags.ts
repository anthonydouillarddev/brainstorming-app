export const TAG_PRESETS: string[] = [
  "UX",
  "Data",
  "Automation",
  "Perf",
  "Mobile",
  "API",
  "DB",
  "Auth",
  "Billing",
  "Admin",
];

export function uniqueTags(items: { tags?: string[] | null }[]): string[] {
  const set = new Set<string>();
  for (const it of items) {
    for (const tag of it.tags ?? []) {
      const t = tag.trim();
      if (t) set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

export function countTags(items: { tags?: string[] | null }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const it of items) {
    for (const tag of it.tags ?? []) {
      const t = tag.trim();
      if (!t) continue;
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}

export function mergeTagSuggestions(presets: string[], known: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...presets, ...known]) {
    const v = raw.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}
