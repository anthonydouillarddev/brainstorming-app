import type { InfoNavState } from "../state";
import { getScreenPath } from "../state";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportUrlMapCsv(state: InfoNavState): string {
  const rows: string[] = [];
  rows.push("screen_id,title,slug,full_path,breadcrumb,is_primary_nav,parent_id");
  for (const screen of state.screens) {
    const path = getScreenPath(state, screen.id);
    const fullPath = "/" + path.map((p) => p.slug).join("/");
    const breadcrumb = path.map((p) => p.title).join(" > ");
    rows.push(
      [
        screen.id,
        escapeCsv(screen.title),
        screen.slug,
        fullPath,
        escapeCsv(breadcrumb),
        screen.isPrimaryNav ? "1" : "0",
        screen.parentId ?? "",
      ].join(",")
    );
  }
  return rows.join("\n");
}
