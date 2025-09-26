"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, FileText, Users, BookOpen, Clock, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, LineChart, Line, CartesianGrid, Tooltip, Legend } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/ui/logo"
import { statusToKey, statusToLabel, statusToBadgeVariant } from "@/lib/classroom-status"
import { StatusChips } from "@/components/shared/status-chips"
import { GradeBadge } from "@/components/shared/grade-badge"
import { ProfileMenu } from "@/components/profile-menu"
import { CalendarIntegration } from "@/components/calendar/calendar-integration"
import { UserAvatar } from "@/components/shared/user-avatar"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/shared/app-logo"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useSession } from "next-auth/react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useNotifications } from "@/contexts/notifications-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TaskStatusFilter } from "@/components/filters/task-status-filter"
import { filterSubmissionsByStatus, getSubmissionStats } from "@/lib/task-status-utils"

// Mock data for teacher dashboard
const myStudents = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    avatar: "/placeholder-w3xp6.png",
    progress: 85,
    lastActivity: "2 horas",
    pendingTasks: 2,
    status: "active",
  },
  {
    id: 2,
    name: "María González",
    avatar: "/student-maria.png",
    progress: 92,
    lastActivity: "30 min",
    pendingTasks: 0,
    status: "active",
  },
  {
    id: 5,
    name: "Diego López",
    avatar: "/student-diego.jpg",
    progress: 67,
    lastActivity: "3 días",
    pendingTasks: 4,
    status: "inactive",
  },
]

const myClasses = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    time: "09:00 - 11:00",
    students: 15,
    attendance: 13,
    status: "upcoming",
  },
  {
    id: 2,
    title: "React Components",
    time: "14:00 - 16:00",
    students: 12,
    attendance: 12,
    status: "completed",
  },
  {
    id: 3,
    title: "Node.js Backend",
    time: "16:30 - 18:30",
    students: 10,
    attendance: 0,
    status: "upcoming",
  },
]

const assignmentData = [
  { name: "Entregadas", value: 45 },
  { name: "Pendientes", value: 12 },
  { name: "Atrasadas", value: 8 },
]

export function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState("javascript-fundamentals")
  const [activeTab, setActiveTab] = useState("overview")
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { user, logout, switchRole } = useAuth()
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const { isVisible: isNavVisible } = useScrollDirection()
  const { generateNotificationsFromClassroomData, addNotification } = useNotifications()
  const [bootstrapped, setBootstrapped] = useState(false)
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

  // Classroom live data state
  const [gcCourses, setGcCourses] = useState<Array<{ id?: string | null; name?: string | null }>>([])
  const [gcSelectedCourseId, setGcSelectedCourseId] = useState<string>("")
  const [gcStudents, setGcStudents] = useState<Array<{ userId?: string | null; profile?: { id?: string | null; name?: string | null; email?: string | null; photoUrl?: string | null } }>>([])
  const [gcCoursework, setGcCoursework] = useState<Array<{ id?: string | null; title?: string | null; maxPoints?: number | null }>>([])
  const [gcSelectedWorkId, setGcSelectedWorkId] = useState<string>("")
  const [gcSubmissions, setGcSubmissions] = useState<Array<{ id?: string | null; userId?: string | null; state?: string | null; late?: boolean | null; assignedGrade?: number | null; alternateLink?: string | null; updateTime?: string | null }>>([])
  const [gcLoading, setGcLoading] = useState(false)
  const [gcError, setGcError] = useState<string | null>(null)
  // Paginación
  const [subPage, setSubPage] = useState<number>(1)
  const [stuPage, setStuPage] = useState<number>(1)
  const pageSize = 20
  const [gcAllSubmissions, setGcAllSubmissions] = useState<Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>>>({})
  
  // Filtros de estado de tareas
  const [selectedTaskStatuses, setSelectedTaskStatuses] = useState<string[]>([])

  const reloadCourses = async () => {
    try {
      setGcLoading(true)
      setGcError(null)
      const resp = await fetch("/api/classroom/courses")
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      setGcCourses(data.courses || [])
      if ((data.courses || []).length > 0) {
        setGcSelectedCourseId(data.courses[0].id || "")
      } else {
        setGcSelectedCourseId("")
        setGcStudents([])
        setGcCoursework([])
        setGcSelectedWorkId("")
        setGcSubmissions([])
        setBootstrapped(true)
      }
    } catch (e: any) {
      setGcError(e?.message || "No se pudieron cargar los cursos")
    } finally {
      setGcLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStatus !== "authenticated") return
    reloadCourses()
  }, [sessionStatus])

  useEffect(() => {
    if (!gcSelectedCourseId) return
    const loadStudentsAndCoursework = async () => {
      try {
        setGcLoading(true)
        setGcError(null)
        const resp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/students`)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        setGcStudents(data.students || [])

        const cwResp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/coursework`)
        if (!cwResp.ok) throw new Error(`HTTP ${cwResp.status}`)
        const cwData = await cwResp.json()
        setGcCoursework(cwData.coursework || [])
        if ((cwData.coursework || []).length > 0) {
          setGcSelectedWorkId(cwData.coursework[0].id || "")
        } else {
          setGcSelectedWorkId("")
          setGcSubmissions([])
        }

        // Load submissions for all coursework (for Students tab aggregation)
        const allSubs: Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>> = {}
        await Promise.all((cwData.coursework || []).map(async (w: any) => {
          const r = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/submissions?courseworkId=${w.id}`)
          if (!r.ok) return
          const json = await r.json()
          allSubs[String(w.id)] = (json.submissions || []).map((s: any) => ({ userId: s.userId, state: s.state, late: s.late }))
        }))
        setGcAllSubmissions(allSubs)
      } catch (e: any) {
        setGcError(e?.message || "No se pudieron cargar los alumnos/tareas")
      } finally {
        setGcLoading(false)
        setBootstrapped(true)
      }
    }
    loadStudentsAndCoursework()
  }, [gcSelectedCourseId])

  useEffect(() => {
    if (!gcSelectedCourseId || !gcSelectedWorkId) return
    const loadSubmissions = async () => {
      try {
        setGcLoading(true)
        setGcError(null)
        const resp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/submissions?courseworkId=${gcSelectedWorkId}`)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        setGcSubmissions(data.submissions || [])
      } catch (e: any) {
        setGcError(e?.message || "No se pudieron cargar las entregas")
      } finally {
        setGcLoading(false)
      }
    }
    loadSubmissions()
  }, [gcSelectedCourseId, gcSelectedWorkId])

  // Filtrado de entregas por estado
  const filteredSubmissions = filterSubmissionsByStatus(gcSubmissions, selectedTaskStatuses)
  const submissionStats = getSubmissionStats(gcSubmissions)
  
  // Derivados de paginación (entregas filtradas)
  const totalSubs = filteredSubmissions.length
  const totalSubPages = Math.max(1, Math.ceil((totalSubs || 0) / pageSize))
  const safeSubPage = Math.min(Math.max(1, subPage), totalSubPages)
  const subStart = (safeSubPage - 1) * pageSize
  const subEnd = Math.min(subStart + pageSize, totalSubs)
  const paginatedSubs = filteredSubmissions.slice(subStart, subEnd)

  // Derivados de paginación (estudiantes)
  const totalStudents = gcStudents.length
  const totalStuPages = Math.max(1, Math.ceil((totalStudents || 0) / pageSize))
  const safeStuPage = Math.min(Math.max(1, stuPage), totalStuPages)
  const stuStart = (safeStuPage - 1) * pageSize
  const stuEnd = Math.min(stuStart + pageSize, totalStudents)
  const paginatedStudents = gcStudents.slice(stuStart, stuEnd)

  // Reset de página al cambiar filtros clave
  useEffect(() => { setSubPage(1) }, [gcSelectedWorkId, gcSelectedCourseId, selectedTaskStatuses])
  useEffect(() => { setStuPage(1) }, [gcSelectedCourseId])

  // Generate notifications from Google Classroom data
  useEffect(() => {
    if (gcCoursework.length > 0 || gcSubmissions.length > 0) {
      generateNotificationsFromClassroomData({
        coursework: gcCoursework.map(work => ({ ...work, courseId: gcSelectedCourseId })),
        submissions: gcSubmissions,
        courses: gcCourses,
      })
    }
  }, [gcCoursework, gcSubmissions, gcCourses, gcSelectedCourseId, generateNotificationsFromClassroomData])

  // Generate notifications for course management
  useEffect(() => {
    if (gcStudents.length > 0 && gcSelectedCourseId) {
      const selectedCourse = gcCourses.find(c => c.id === gcSelectedCourseId)
      if (selectedCourse) {
        addNotification({
          title: "Gestión de curso",
          message: `Gestionando curso: ${selectedCourse.name} (${gcStudents.length} estudiantes)`,
          type: "system",
          priority: "low",
          courseId: gcSelectedCourseId,
        })
      }
    }
  }, [gcStudents.length, gcSelectedCourseId, gcCourses, addNotification])

  // Serie real de progreso del curso (por semanas según dueDate del coursework)
  const courseProgressSeries = (() => {
    try {
      const studentsCount = gcStudents.length || 0
      if (!studentsCount) return [] as Array<{ week: string; progress: number }>
      const works = (gcCoursework || [])
        .map((w: any) => ({
          id: String(w.id),
          title: w.title || String(w.id),
          dueDate: (w as any)?.dueDate ? new Date((w as any).dueDate.year, ((w as any).dueDate.month || 1) - 1, (w as any).dueDate.day || 1) : null,
        }))
        .filter((w) => !!w.dueDate)
        .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))

      if (works.length === 0) return []

      let completedSoFar = 0
      const series: Array<{ week: string; progress: number }> = []
      for (let i = 0; i < works.length; i++) {
        const w = works[i]
        const subs = (gcAllSubmissions as any)[String(w.id)] || []
        const completedForWork = subs.filter((s: any) => s.state === "TURNED_IN" || s.state === "RETURNED").length
        completedSoFar += completedForWork
        const denom = studentsCount * (i + 1)
        const pct = denom > 0 ? Math.round((completedSoFar / denom) * 100) : 0
        series.push({ week: `Sem ${i + 1}`, progress: pct })
      }
      return series
    } catch {
      return [] as Array<{ week: string; progress: number }>
    }
  })();

  const handleGradeAssignment = (studentId: number) => {
    console.log("[v0] Grading assignment for student:", studentId)
    router.push(`/students/${studentId}/grade`)
  }

  const handleSendReminder = (studentId: number) => {
    console.log("[v0] Sending reminder to student:", studentId)
    router.push(`/notifications?studentId=${studentId}`)
  }

  const handleViewStudentProfile = (userId: string, email: string) => {
    if (!gcSelectedCourseId || !userId) {
      console.warn("No se puede abrir el perfil: falta courseId o userId")
      return
    }
    
    // URL para ver el perfil del estudiante en Google Classroom
    const classroomProfileUrl = `https://classroom.google.com/c/${gcSelectedCourseId}/p/${userId}`
    
    // Abrir en nueva pestaña
    window.open(classroomProfileUrl, '_blank', 'noopener,noreferrer')
  }

  // Mostrar skeleton durante la carga inicial
  if (!bootstrapped || sessionStatus === "loading") {
    return <FullPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:h-16 sm:items-center sm:justify-between px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3">
            <AppLogo width={140} height={35} />
            {isMock && <Badge variant="outline" className="ml-2">Mock Mode</Badge>}
            <span className="text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">Profesor</span>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={user?.role}
              onValueChange={(role) => {
                switchRole(role as any)
                router.replace(`/dashboard/${role}`)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinator">Coordinador</SelectItem>
                <SelectItem value="teacher">Profesor</SelectItem>
                <SelectItem value="student">Estudiante</SelectItem>
              </SelectContent>
            </Select>

            <NotificationCenter />
            <ThemeToggle />
            <ProfileMenu user={user!} onLogout={() => logout()} />
          </div>
        </div>
      </header>

      {/* Navigation Tabs with Scroll Animation */}
      <div className={`border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4 sticky top-16 z-40 transition-transform duration-300 ease-in-out ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex gap-2 sm:gap-4 overflow-x-auto whitespace-nowrap">
          <Button variant={activeTab === "overview" ? "secondary" : "ghost"} onClick={() => setActiveTab("overview")}>
            Resumen
          </Button>
          <Button variant={activeTab === "calendar" ? "secondary" : "ghost"} onClick={() => setActiveTab("calendar")}>
            Calendario
          </Button>
          <Button variant={activeTab === "students" ? "secondary" : "ghost"} onClick={() => setActiveTab("students")}>
            Estudiantes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Classroom Live Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Classroom (en vivo)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionStatus !== "authenticated" ? (
                  <div className="text-sm text-muted-foreground">
                    Inicia sesión con Google en <span className="font-medium">Integración: Google Classroom</span> para ver datos reales.
                  </div>
                ) : gcCourses.length === 0 ? (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>No tienes cursos en Google Classroom con esta cuenta.</p>
                    <p>
                      Crea o únete a un curso en {" "}
                      <a href="https://classroom.google.com" target="_blank" rel="noreferrer" className="text-primary underline">classroom.google.com</a>
                      , luego vuelve y refresca esta página.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Curso:</label>
                        <Select value={gcSelectedCourseId} onValueChange={setGcSelectedCourseId}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={gcLoading ? "Cargando cursos..." : "Seleccionar curso"} />
                          </SelectTrigger>
                          <SelectContent>
                            {gcCourses.map((c) => (
                              <SelectItem key={c.id || "unknown"} value={c.id || ""}>
                                {c.name || c.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" size="sm" onClick={reloadCourses} disabled={gcLoading}>
                        {gcLoading ? "Actualizando..." : "Actualizar"}
                      </Button>
                      {gcError && <span className="text-sm text-destructive">{gcError}</span>}
                    </div>

                    {/* Summary by status */}
                    {gcSelectedWorkId && (
                      <StatusChips items={gcSubmissions.map((s) => ({ state: s.state, late: s.late }))} />
                    )}

                    {/* Progreso del Curso (real) */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-balance">Progreso del Curso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {courseProgressSeries.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No hay suficientes datos para calcular el progreso.</div>
                        ) : (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={courseProgressSeries} margin={{ left: 8, right: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} stroke="var(--border)" tick={{ fill: 'var(--muted-foreground)' }} />
                                <YAxis hide={false} stroke="var(--border)" tick={{ fill: 'var(--muted-foreground)' }} />
                                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)' }} />
                                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                                <Line
                                  type="monotone"
                                  dataKey="progress"
                                  name="Progreso"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={3}
                                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                                  activeDot={{ r: 7, stroke: 'var(--foreground)', strokeWidth: 1 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Tarea:</label>
                        <Select value={gcSelectedWorkId} onValueChange={setGcSelectedWorkId}>
                          <SelectTrigger className="w-full sm:w-80">
                            <SelectValue placeholder={gcLoading ? "Cargando tareas..." : "Seleccionar tarea"} />
                          </SelectTrigger>
                          <SelectContent>
                            {gcCoursework.map((w) => (
                              <SelectItem key={w.id || "unknown"} value={w.id || ""}>
                                {w.title || w.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {gcCoursework.length === 0 && (
                        <span className="text-sm text-muted-foreground">Este curso no tiene tareas aún.</span>
                      )}
                    </div>

                    {/* Filtros de estado de tareas */}
                    {gcSelectedWorkId && gcSubmissions.length > 0 && (
                      <div className="border-t pt-4">
                        <TaskStatusFilter
                          selectedStatuses={selectedTaskStatuses}
                          onStatusChange={setSelectedTaskStatuses}
                          totalCount={gcSubmissions.length}
                          filteredCount={totalSubs}
                          className="mb-4"
                        />
                      </div>
                    )}

                    {/* Review Table: submissions */}
                    {/* Mobile cards */}
                    <div className="sm:hidden space-y-3">
                      {gcLoading ? (
                        <div className="text-sm text-muted-foreground">Cargando entregas...</div>
                      ) : gcSelectedWorkId && gcSubmissions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No hay entregas para esta tarea.</div>
                      ) : (
                        paginatedSubs.map((sub) => {
                          const student = gcStudents.find((s) => s.userId === sub.userId)
                          const name = student?.profile?.name || sub.userId || "-"
                          const email = student?.profile?.email || "-"
                          const key = statusToKey(sub.state as string | undefined, sub.late as boolean | null)
                          const label = statusToLabel(key)
                          const variant = statusToBadgeVariant(key)
                          const work = gcCoursework.find((w) => String(w.id) === String(gcSelectedWorkId))
                          return (
                            <div key={sub.id || Math.random().toString()} className="rounded-lg border p-3 bg-card">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                                </div>
                                <span className={`shrink-0 inline-flex items-center px-2 py-1 rounded border text-xs ${variant === "default" ? "bg-primary text-primary-foreground border-transparent" : variant === "destructive" ? "text-destructive border-destructive/40" : "text-muted-foreground border-border"}`}>{label}</span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Tarde</span>
                                <span className="font-medium">{sub.late ? "Sí" : "No"}</span>
                              </div>
                              <div className="mt-2">
                                <GradeBadge assigned={sub.assignedGrade ?? null} maxPoints={(work?.maxPoints as number | null) ?? null} />
                              </div>
                              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                                {sub.alternateLink ? (
                                  <a href={sub.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline text-sm">Abrir en Classroom</a>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Desktop table */}
                    <div className="overflow-x-auto hidden sm:block">
                      <Table className="table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Tarde</TableHead>
                            <TableHead>Nota</TableHead>
                            <TableHead>Enlace</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gcLoading ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <span className="text-sm text-muted-foreground">Cargando entregas...</span>
                              </TableCell>
                            </TableRow>
                          ) : gcSelectedWorkId && gcSubmissions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6}>
                                <span className="text-sm text-muted-foreground">No hay entregas para esta tarea.</span>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedSubs.map((sub) => {
                              const student = gcStudents.find((s) => s.userId === sub.userId)
                              const name = student?.profile?.name || sub.userId || "-"
                              const email = student?.profile?.email || "-"
                              return (
                                <TableRow key={sub.id || Math.random().toString()}>
                                  <TableCell>{name}</TableCell>
                                  <TableCell><span className="text-sm text-muted-foreground">{email}</span></TableCell>
                                  <TableCell>
                                    {(() => {
                                      const key = statusToKey(sub.state as string | undefined, sub.late as boolean | null)
                                      const label = statusToLabel(key)
                                      const variant = statusToBadgeVariant(key)
                                      return (
                                        <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${variant === "default" ? "bg-primary text-primary-foreground border-transparent" : variant === "destructive" ? "text-destructive border-destructive/40" : "text-muted-foreground border-border"}`}>
                                          {label}
                                        </span>
                                      )
                                    })()}
                                  </TableCell>
                                  <TableCell>{sub.late ? "Sí" : "No"}</TableCell>
                                  <TableCell>
                                    {(() => {
                                      const work = gcCoursework.find((w) => String(w.id) === String(gcSelectedWorkId))
                                      return <GradeBadge assigned={sub.assignedGrade ?? null} maxPoints={(work?.maxPoints as number | null) ?? null} />
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {sub.alternateLink ? (
                                        <a href={sub.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline">Abrir</a>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                      {/* Paginación de entregas */}
                      {totalSubs > pageSize && (
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Mostrando {subStart + 1}–{subEnd} de {totalSubs}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={safeSubPage <= 1} onClick={() => setSubPage((p: number) => Math.max(1, p - 1))}>Anterior</Button>
                            <span className="text-sm">Página {safeSubPage} / {totalSubPages}</span>
                            <Button variant="outline" size="sm" disabled={safeSubPage >= totalSubPages} onClick={() => setSubPage((p: number) => Math.min(totalSubPages, p + 1))}>Siguiente</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {/* Se removieron secciones con datos ficticios. */}
          </div>
        )}

        {activeTab === "calendar" && <CalendarIntegration />}

        {activeTab === "students" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Estudiantes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Haz click en cualquier fila de estudiante para ver su perfil en Google Classroom
                </p>
              </CardHeader>
              <CardContent>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {gcStudents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Selecciona un curso para ver sus estudiantes.</div>
                  ) : (
                    paginatedStudents.map((s) => {
                      const fullName = s.profile?.name || s.userId || "-"
                      const email = s.profile?.email || "-"
                      const totalWorks = gcCoursework.length || 0
                      let completed = 0
                      let overdue = 0
                      let pending = 0
                      for (const w of gcCoursework) {
                        const subs = gcAllSubmissions[String(w.id)] || []
                        const mine = subs.find((x) => x.userId === s.userId)
                        if (!mine) {
                          pending += 1
                        } else if (mine.state === "TURNED_IN" || mine.state === "RETURNED") {
                          completed += 1
                        } else if (mine.late) {
                          overdue += 1
                        } else {
                          pending += 1
                        }
                      }
                      const pct = totalWorks > 0 ? Math.round((completed / totalWorks) * 100) : 0
                      return (
                        <div 
                          key={s.userId || email} 
                          className="rounded-lg border p-3 bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleViewStudentProfile(s.userId || "", email)}
                          title={`Ver perfil de ${fullName} en Google Classroom`}
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar name={fullName} email={email} photoUrl={s.profile?.photoUrl || null} size={40} />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{fullName}</div>
                              <div className="text-xs text-muted-foreground truncate">{email}</div>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="font-medium">{pct}%</span>
                            </div>
                            <Progress value={pct} />
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-green-400">Completadas: {completed}</span>
                              <span className="text-amber-400">Atrasadas: {overdue}</span>
                              <span className="text-red-400">Pendientes: {pending}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                  <Table className="table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Completadas</TableHead>
                        <TableHead>Atrasadas</TableHead>
                        <TableHead>Pendientes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gcStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <span className="text-sm text-muted-foreground">Selecciona un curso para ver sus estudiantes.</span>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedStudents.map((s) => {
                          const fullName = s.profile?.name || s.userId || "-"
                          const email = s.profile?.email || "-"
                          const totalWorks = gcCoursework.length || 0
                          let completed = 0
                          let overdue = 0
                          let pending = 0
                          for (const w of gcCoursework) {
                            const subs = gcAllSubmissions[String(w.id)] || []
                            const mine = subs.find((x) => x.userId === s.userId)
                            if (!mine) {
                              pending += 1
                            } else if (mine.state === "TURNED_IN" || mine.state === "RETURNED") {
                              completed += 1
                            } else if (mine.late) {
                              overdue += 1
                            } else {
                              pending += 1
                            }
                          }
                          const pct = totalWorks > 0 ? Math.round((completed / totalWorks) * 100) : 0
                          return (
                            <TableRow 
                              key={s.userId || email}
                              className="cursor-pointer hover:bg-accent/50 transition-colors"
                              onClick={() => handleViewStudentProfile(s.userId || "", email)}
                              title={`Ver perfil de ${fullName} en Google Classroom`}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <UserAvatar name={fullName} email={email} photoUrl={s.profile?.photoUrl || null} size={32} />
                                  <span className="font-medium">{fullName}</span>
                                </div>
                              </TableCell>
                              <TableCell><span className="text-sm text-muted-foreground">{email}</span></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Progress value={pct} className="w-20" />
                                  <span className="text-sm font-medium">{pct}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{completed}</TableCell>
                              <TableCell>{overdue}</TableCell>
                              <TableCell>{pending}</TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                  {/* Paginación estudiantes */}
                  {totalStudents > pageSize && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mostrando {stuStart + 1}–{stuEnd} de {totalStudents}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={safeStuPage <= 1} onClick={() => setStuPage((p: number) => Math.max(1, p - 1))}>Anterior</Button>
                        <span className="text-sm">Página {safeStuPage} / {totalStuPages}</span>
                        <Button variant="outline" size="sm" disabled={safeStuPage >= totalStuPages} onClick={() => setStuPage((p: number) => Math.min(totalStuPages, p + 1))}>Siguiente</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
