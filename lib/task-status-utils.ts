// Utilidades para manejar estados de tareas y filtros

export type TaskStatus = "turned_in" | "assigned" | "returned" | "late" | "missing"

export interface TaskSubmission {
  id?: string | null
  userId?: string | null
  state?: string | null
  late?: boolean | null
  assignedGrade?: number | null
  alternateLink?: string | null
  updateTime?: string | null
}

/**
 * Mapea el estado de Google Classroom a nuestros estados de filtro
 */
export function mapSubmissionToTaskStatus(submission: TaskSubmission): TaskStatus {
  const state = submission.state?.toLowerCase()
  const isLate = submission.late === true

  // Si está marcado como tarde, siempre es "late"
  if (isLate && (state === "turned_in" || state === "returned")) {
    return "late"
  }

  // Mapear estados de Google Classroom
  switch (state) {
    case "turned_in":
      return "turned_in"
    case "returned":
      return "returned"
    case "created":
    case "reclaimed_by_student":
      return "assigned"
    default:
      return "missing"
  }
}

/**
 * Filtra las entregas basado en los estados seleccionados
 */
export function filterSubmissionsByStatus(
  submissions: TaskSubmission[],
  selectedStatuses: string[]
): TaskSubmission[] {
  if (selectedStatuses.length === 0) {
    return submissions
  }

  return submissions.filter(submission => {
    const status = mapSubmissionToTaskStatus(submission)
    return selectedStatuses.includes(status)
  })
}

/**
 * Cuenta las entregas por estado
 */
export function countSubmissionsByStatus(submissions: TaskSubmission[]): Record<TaskStatus, number> {
  const counts: Record<TaskStatus, number> = {
    turned_in: 0,
    assigned: 0,
    returned: 0,
    late: 0,
    missing: 0
  }

  submissions.forEach(submission => {
    const status = mapSubmissionToTaskStatus(submission)
    counts[status]++
  })

  return counts
}

/**
 * Obtiene estadísticas resumidas de las entregas
 */
export function getSubmissionStats(submissions: TaskSubmission[]) {
  const counts = countSubmissionsByStatus(submissions)
  const total = submissions.length
  
  return {
    total,
    counts,
    percentages: {
      turned_in: total > 0 ? Math.round((counts.turned_in / total) * 100) : 0,
      assigned: total > 0 ? Math.round((counts.assigned / total) * 100) : 0,
      returned: total > 0 ? Math.round((counts.returned / total) * 100) : 0,
      late: total > 0 ? Math.round((counts.late / total) * 100) : 0,
      missing: total > 0 ? Math.round((counts.missing / total) * 100) : 0,
    }
  }
}
