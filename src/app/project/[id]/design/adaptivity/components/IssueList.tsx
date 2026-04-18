"use client";

import type { AdaptivityIssue } from "../validators";

export default function IssueList({ issues }: { issues: AdaptivityIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="space-y-1">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className={`text-xs px-3 py-2 rounded border ${
            issue.severity === "error"
              ? "bg-red-500/5 border-red-500/30 text-red-600 dark:text-red-400"
              : "bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          {issue.severity === "error" ? "❌" : "⚠️"} {issue.message}
        </div>
      ))}
    </div>
  );
}
