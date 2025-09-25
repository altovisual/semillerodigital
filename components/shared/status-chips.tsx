"use client"

import { statusToBadgeVariant, statusToKey, statusToLabel } from "@/lib/classroom-status"

export interface StatusItem {
  state?: string | null
  late?: boolean | null
}

export function StatusChips({ items, className = "" }: { items: StatusItem[]; className?: string }) {
  const counts: Record<string, number> = {}
  for (const it of items) {
    const k = statusToKey(it.state, it.late ?? null)
    counts[k] = (counts[k] || 0) + 1
  }

  const order: Array<{ key: "pending" | "in_progress" | "completed" | "overdue"; label: string }> = [
    { key: "pending", label: statusToLabel("pending") },
    { key: "in_progress", label: statusToLabel("in_progress") },
    { key: "completed", label: statusToLabel("completed") },
    { key: "overdue", label: statusToLabel("overdue") },
  ]

  return (
    <div className={`flex items-center gap-2 flex-wrap text-sm ${className}`}>
      {order.map(({ key, label }) => {
        const variant = statusToBadgeVariant(key)
        const base =
          variant === "default"
            ? "bg-primary text-primary-foreground border-transparent"
            : variant === "destructive"
            ? "text-destructive border-destructive/40"
            : "text-muted-foreground border-border"
        return (
          <span key={key} className={`inline-flex items-center px-2 py-1 rounded border ${base}`}>
            {label}: {counts[key] || 0}
          </span>
        )
      })}
    </div>
  )
}
