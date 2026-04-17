"use client";

export default function BlockStatus({
  ok,
  hasError,
  hasWarn,
}: {
  ok: boolean;
  hasError: boolean;
  hasWarn: boolean;
}) {
  if (hasError) {
    return (
      <span className="text-[11px] flex items-center gap-1 text-red-500">
        <span className="w-2 h-2 rounded-full bg-red-500" /> À corriger
      </span>
    );
  }
  if (hasWarn) {
    return (
      <span className="text-[11px] flex items-center gap-1 text-amber-500">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> À améliorer
      </span>
    );
  }
  if (ok) {
    return (
      <span className="text-[11px] flex items-center gap-1 text-green-600">
        <span className="w-2 h-2 rounded-full bg-green-500" /> Complet
      </span>
    );
  }
  return (
    <span className="text-[11px] flex items-center gap-1 text-muted">
      <span className="w-2 h-2 rounded-full bg-muted/50" /> À remplir
    </span>
  );
}
