"use client"

import { Badge } from "@/components/ui/badge"
import { formatGrade } from "@/lib/classroom-status"

export function GradeBadge({ assigned, maxPoints, className = "" }: { assigned?: number | null; maxPoints?: number | null; className?: string }) {
  const text = formatGrade(assigned ?? null, maxPoints ?? null)
  if (!text) return null
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>{text}</Badge>
  )
}
