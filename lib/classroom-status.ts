export type StatusKey = "pending" | "in_progress" | "completed" | "overdue"

// Normalize a Classroom submission state + late flag into a UI status key
export function statusToKey(state?: string | null, late?: boolean | null): StatusKey {
  if (state === "TURNED_IN" || state === "RETURNED" || state === "COMPLETED") return "completed"
  if (state === "OVERDUE" || late) return "overdue"
  if (state === "NO_SUBMISSION" || state === "PENDING") return "pending"
  return "in_progress"
}

export function statusToLabel(key: StatusKey): string {
  switch (key) {
    case "completed":
      return "Completada"
    case "pending":
      return "Pendiente"
    case "in_progress":
      return "En Progreso"
    case "overdue":
      return "Atrasada"
    default:
      return "Pendiente"
  }
}

// Map to shadcn badge variants
export function statusToBadgeVariant(key: StatusKey): "default" | "secondary" | "destructive" {
  switch (key) {
    case "completed":
      return "default"
    case "overdue":
      return "destructive"
    case "pending":
    case "in_progress":
    default:
      return "secondary"
  }
}

// Format a grade with optional percentage when maxPoints is available
export function formatGrade(assigned?: number | null, maxPoints?: number | null): string | null {
  if (typeof assigned !== "number") return null
  if (typeof maxPoints !== "number" || maxPoints <= 0) return String(assigned)
  const pct = Math.round((assigned / maxPoints) * 100)
  return `${assigned} / ${maxPoints} (${pct}%)`
}
