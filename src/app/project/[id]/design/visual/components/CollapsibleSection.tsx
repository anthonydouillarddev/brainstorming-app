"use client";

import { useState, type ReactNode } from "react";

export default function CollapsibleSection({
  title,
  subtitle,
  showCountInTitle,
  defaultCollapsed = true,
  topRight,
  expandButtonLabel,
  className = "",
  headerClassName = "text-xl font-bold",
  children,
  id,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  showCountInTitle?: ReactNode;
  defaultCollapsed?: boolean;
  topRight?: ReactNode;
  expandButtonLabel?: ReactNode;
  className?: string;
  headerClassName?: string;
  children: ReactNode;
  id?: string;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div id={id} className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`${headerClassName} flex items-center gap-2 hover:text-accent transition cursor-pointer text-left`}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Déplier" : "Replier"}
        >
          <span aria-hidden>{collapsed ? "▶" : "▼"}</span>
          {title}
          {showCountInTitle != null && (
            <span className="text-muted font-normal text-sm">{showCountInTitle}</span>
          )}
        </button>
        {!collapsed && topRight}
      </div>

      {subtitle && !collapsed && <div className="text-xs text-muted -mt-2">{subtitle}</div>}

      {collapsed && expandButtonLabel && (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ {expandButtonLabel}
        </button>
      )}

      {!collapsed && children}
    </div>
  );
}
