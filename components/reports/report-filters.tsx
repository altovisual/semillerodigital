"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export type ReportFilterValue = {
  role: "coordinator" | "teacher" | "student" | "all" | string
  cohort: string
  course: string
  range: "7d" | "14d" | "30d" | "90d" | string
}

export function ReportFilters({ value, onChange }: { value: ReportFilterValue; onChange: (v: ReportFilterValue) => void }) {
  const { data: session, status: sessionStatus } = useSession()
  const [realCourses, setRealCourses] = useState<Array<{ id: string; name: string }>>([])

  // Cargar cursos reales de Google Classroom
  useEffect(() => {
    const loadCourses = async () => {
      if (sessionStatus !== "authenticated") return
      
      try {
        const resp = await fetch("/api/classroom/courses")
        if (resp.ok) {
          const data = await resp.json()
          const courses = (data.courses || []).map((c: any) => ({
            id: c.id || "",
            name: c.name || `Curso ${c.id}`
          }))
          setRealCourses(courses)
        }
      } catch (error) {
        console.warn("Error loading courses for filters:", error)
      }
    }

    loadCourses()
  }, [sessionStatus])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rol</span>
        <Select value={value.role} onValueChange={(v) => onChange({ ...value, role: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="coordinator">Coordinador</SelectItem>
            <SelectItem value="teacher">Profesor</SelectItem>
            <SelectItem value="student">Estudiante</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Cohorte</span>
        <Select value={value.cohort} onValueChange={(v) => onChange({ ...value, cohort: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Cohorte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="dw-2025-q1">Desarrollo Web - 2025 Q1</SelectItem>
            <SelectItem value="dw-2025-q2">Desarrollo Web - 2025 Q2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Curso</span>
        <Select value={value.course} onValueChange={(v) => onChange({ ...value, course: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {realCourses.length > 0 ? (
              realCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))
            ) : (
              <>
                <SelectItem value="js">JavaScript</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rango</span>
        <Select value={value.range} onValueChange={(v) => onChange({ ...value, range: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 días</SelectItem>
            <SelectItem value="14d">14 días</SelectItem>
            <SelectItem value="30d">30 días</SelectItem>
            <SelectItem value="90d">90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange({ role: "all", cohort: "all", course: "all", range: "30d" })}>
          Limpiar
        </Button>
      </div>
    </div>
  )
}
