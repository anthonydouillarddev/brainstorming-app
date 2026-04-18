"use client";

export default function BlockStatus({
  filled,
  total,
  label,
}: {
  filled: number;
  total: number;
  label?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const color =
    pct >= 100
      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
      : pct >= 50
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
      : "bg-muted/15 text-muted border-border";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${color}`}
      aria-label={label ?? `${filled}/${total} remplis`}
    >
      <span className="font-mono tabular-nums">
        {filled}/{total}
      </span>
      {pct >= 100 ? <span aria-hidden>✓</span> : null}
    </span>
  );
}
