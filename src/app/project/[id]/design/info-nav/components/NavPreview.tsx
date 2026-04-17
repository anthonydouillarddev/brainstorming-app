"use client";

import type { InfoNavState, NavPattern, SitemapScreen } from "../state";

export default function NavPreview({
  pattern,
  state,
}: {
  pattern: NavPattern;
  state: InfoNavState;
}) {
  const navScreens = state.navItems
    .map((id) => state.screens.find((s) => s.id === id))
    .filter((s): s is SitemapScreen => !!s);
  const items = navScreens.slice(0, 6);

  if (pattern === "sidebar" || pattern === "sidebar-collapsible") {
    return (
      <div className="flex border border-border rounded-lg overflow-hidden bg-card h-60">
        <aside
          className={`${
            pattern === "sidebar-collapsible" ? "w-12" : "w-40"
          } border-r border-border bg-card/70 p-2 space-y-1 shrink-0`}
        >
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 px-1 truncate">
            {pattern === "sidebar-collapsible" ? "≡" : "Mon app"}
          </div>
          {items.length === 0 ? (
            <div className="text-[10px] text-muted/60 italic px-1">0 item</div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  i === 0 ? "bg-accent/20 text-accent" : "text-foreground/80"
                }`}
              >
                <span>{item.emoji ?? "📄"}</span>
                {pattern !== "sidebar-collapsible" && <span className="truncate">{item.title}</span>}
              </div>
            ))
          )}
        </aside>
        <main className="flex-1 p-3 space-y-2">
          <div className="text-xs text-muted">Aperçu de la page active</div>
          <div className="h-4 w-3/4 bg-card/60 rounded" />
          <div className="h-4 w-1/2 bg-card/60 rounded" />
          <div className="h-4 w-5/6 bg-card/60 rounded" />
        </main>
      </div>
    );
  }

  if (pattern === "top-tabs") {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card h-60 flex flex-col">
        <header className="border-b border-border bg-card/70 px-3 py-2 flex items-center gap-1 overflow-x-auto">
          <div className="text-xs font-bold text-muted mr-3 shrink-0">Mon app</div>
          {items.length === 0 ? (
            <div className="text-[10px] text-muted/60 italic">0 tab</div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                  i === 0 ? "bg-accent/20 text-accent border border-accent/30" : "text-muted"
                }`}
              >
                <span className="mr-1">{item.emoji ?? "📄"}</span>
                {item.title}
              </div>
            ))
          )}
        </header>
        <main className="flex-1 p-3 space-y-2">
          <div className="text-xs text-muted">Contenu onglet actif</div>
          <div className="h-4 w-3/4 bg-card/60 rounded" />
          <div className="h-4 w-1/2 bg-card/60 rounded" />
        </main>
      </div>
    );
  }

  if (pattern === "bottom-nav") {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card h-60 flex flex-col max-w-[280px] mx-auto">
        <header className="border-b border-border bg-card/70 px-3 py-2">
          <div className="text-xs font-bold">Mon app</div>
        </header>
        <main className="flex-1 p-3 space-y-2">
          <div className="text-xs text-muted">Feed / écran principal</div>
          <div className="h-4 w-3/4 bg-card/60 rounded" />
          <div className="h-4 w-1/2 bg-card/60 rounded" />
        </main>
        <nav className="border-t border-border bg-card/70 flex items-stretch">
          {items.length === 0 ? (
            <div className="text-[10px] text-muted/60 italic p-2 w-full text-center">
              0 item
            </div>
          ) : (
            items.slice(0, 5).map((item, i) => (
              <div
                key={item.id}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                  i === 0 ? "text-accent" : "text-muted"
                }`}
              >
                <span className="text-base">{item.emoji ?? "📄"}</span>
                <span className="truncate max-w-full px-1">{item.title}</span>
              </div>
            ))
          )}
        </nav>
      </div>
    );
  }

  if (pattern === "hybrid") {
    return (
      <div className="space-y-2">
        <div className="text-[10px] font-semibold text-muted">Desktop</div>
        <div className="flex border border-border rounded-lg overflow-hidden bg-card h-40">
          <aside className="w-36 border-r border-border bg-card/70 p-2 space-y-1 shrink-0">
            {items.slice(0, 5).map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                  i === 0 ? "bg-accent/20 text-accent" : "text-muted"
                }`}
              >
                <span>{item.emoji ?? "📄"}</span>
                <span className="truncate">{item.title}</span>
              </div>
            ))}
          </aside>
          <main className="flex-1 p-3 space-y-1">
            <div className="h-3 w-3/4 bg-card/60 rounded" />
            <div className="h-3 w-1/2 bg-card/60 rounded" />
          </main>
        </div>
        <div className="text-[10px] font-semibold text-muted mt-3">Mobile</div>
        <div className="border border-border rounded-lg overflow-hidden bg-card h-40 flex flex-col max-w-[200px]">
          <main className="flex-1 p-2">
            <div className="h-3 w-3/4 bg-card/60 rounded mb-1" />
            <div className="h-3 w-1/2 bg-card/60 rounded" />
          </main>
          <nav className="border-t border-border flex">
            {items.slice(0, 5).map((item, i) => (
              <div
                key={item.id}
                className={`flex-1 flex flex-col items-center py-1.5 text-[9px] ${
                  i === 0 ? "text-accent" : "text-muted"
                }`}
              >
                <span>{item.emoji ?? "📄"}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  // command-only
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card h-60 flex flex-col items-center justify-center p-6 relative">
      <div className="text-xs text-muted mb-2">Écran principal</div>
      <div className="bg-card/80 border border-accent rounded-lg shadow-2xl p-3 w-full max-w-xs space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>⌘K</span>
          <span>Cherche une action…</span>
        </div>
        {items.slice(0, 4).map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
              i === 0 ? "bg-accent/10 text-accent" : "text-muted"
            }`}
          >
            <span>{item.emoji ?? "📄"}</span>
            <span className="truncate">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
