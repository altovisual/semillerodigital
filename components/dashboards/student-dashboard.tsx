"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, User, Bell, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/ui/logo"
import { useSession } from "next-auth/react"
import { ProfileMenu } from "@/components/profile-menu"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { statusToKey, statusToLabel, statusToBadgeVariant } from "@/lib/classroom-status"
import { StatusChips } from "@/components/shared/status-chips"
import { GradeBadge } from "@/components/shared/grade-badge"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/shared/app-logo"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useNotifications } from "@/contexts/notifications-context"

// Nota: Eliminado fallback de tareas mock. Solo se muestran tareas reales de Classroom.

const upcomingClasses = [
  {
    id: 1,
    title: "JavaScript Avanzado",
    teacher: "Juan Pérez",
    time: "09:00 - 11:00",
    date: "Hoy",
  },
  {
    id: 2,
    title: "React Components",
    teacher: "María Gómez",
    time: "14:00 - 16:00",
    date: "Hoy",
  },
  {
    id: 3,
    title: "Node.js Backend",
    teacher: "Juan Pérez",
    time: "09:00 - 11:00",
    date: "Mañana",
  },
]

// Serie del gráfico se construye dinámicamente a partir de tareas reales
const initialProgressData: Array<{ week: string; progress: number }> = []

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed" | "overdue">("all")
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout, switchRole } = useAuth()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { isVisible: isNavVisible } = useScrollDirection()
  const { generateNotificationsFromClassroomData, addNotification } = useNotifications()
  const [bootstrapped, setBootstrapped] = useState(false)
  const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

  // Classroom live data state (student-focused)
  const [gcCourses, setGcCourses] = useState<Array<{ id?: string | null; name?: string | null }>>([])
  const [gcSelectedCourseId, setGcSelectedCourseId] = useState<string>("")
  const [gcMyUserId, setGcMyUserId] = useState<string>("")
  const [gcCoursework, setGcCoursework] = useState<Array<{ id?: string | null; title?: string | null; dueDate?: any; maxPoints?: number | null }>>([])
  const [gcMyTasks, setGcMyTasks] = useState<Array<{ id: string; title: string; courseId: string; courseName: string; dueDate?: string; state?: string | null; late?: boolean | null; assignedGrade?: number | null; alternateLink?: string | null }>>([])
  const [gcLoading, setGcLoading] = useState(false)
  const [gcError, setGcError] = useState<string | null>(null)

  // Google Calendar: eventos próximos
  type CalendarEvent = { id: string; summary: string; start: string | null; end: string | null; location?: string | null; hangoutLink?: string | null }
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarError, setCalendarError] = useState<string | null>(null)

  // Helpers: estado y agregaciones
  const isCompleted = (state?: string | null) => state === "TURNED_IN" || state === "RETURNED" || state === "COMPLETED"
  const isOverdue = (state?: string | null, late?: boolean | null) => state === "OVERDUE" || !!late
  const isPending = (state?: string | null) => state === "NO_SUBMISSION" || state === "PENDING"

  const parseDate = (s?: string) => {
    if (!s) return null
    const [y, m, d] = s.split("-").map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  // Cargar eventos de Google Calendar (próximos 30 días)
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        if (sessionStatus !== "authenticated") return
        setCalendarError(null)
        const now = new Date()
        const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        const url = `/api/calendar/events?timeMin=${encodeURIComponent(now.toISOString())}&timeMax=${encodeURIComponent(in30.toISOString())}&calendarId=primary`
        const res = await fetch(url)
        if (!res.ok) {
          // 401 cuando no hay token de Google o no se aceptó el scope
          setCalendarEvents([])
          return
        }
        const data = await res.json()
        setCalendarEvents((data.events || []).slice(0, 5))
      } catch (e: any) {
        setCalendarError(e?.message || "No se pudieron cargar los eventos del calendario")
      }
    }
    loadCalendar()
  }, [sessionStatus])

  const getWeekId = (dt: Date) => {
    // Calcula semana ISO aproximada y año
    const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`
  }

  const buildProgressSeries = (tasks: typeof gcMyTasks) => {
    // Agrupa por semana (por dueDate). Usa progreso acumulado (%) hasta esa semana.
    if (!tasks || tasks.length === 0) return initialProgressData
    const items = tasks
      .map((t) => ({ date: parseDate(t.dueDate), isDone: isCompleted(t.state) }))
      .filter((x) => x.date !== null) as Array<{ date: Date; isDone: boolean }>
    if (items.length === 0) return initialProgressData
    items.sort((a, b) => a.date.getTime() - b.date.getTime())
    const total = tasks.length
    let doneSoFar = 0
    const byWeek = new Map<string, number>()
    for (const it of items) {
      if (it.isDone) doneSoFar += 1
      const wk = getWeekId(it.date)
      const pct = Math.round((doneSoFar / total) * 100)
      byWeek.set(wk, pct)
    }
    // Normaliza a pares ordenados para el gráfico
    const series = Array.from(byWeek.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([, pct], idx) => ({ week: `Sem ${idx + 1}`, progress: pct }))
    // Asegura al menos 3-5 puntos para suavidad; si hay pocos, completa con últimos valores
    while (series.length < 5 && series.length > 0) {
      series.push({ week: `Sem ${series.length + 1}`, progress: series[series.length - 1].progress })
    }
    return series
  }

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
        setGcMyTasks([])
        setGcCoursework([])
        setGcMyUserId("")
        setBootstrapped(true)
      }
    } catch (e: any) {
      setGcError(e?.message || "No se pudieron cargar los cursos")
    } finally {
      setGcLoading(false)
    }
  }

  // Load courses when authenticated
  useEffect(() => {
    if (sessionStatus !== "authenticated") return
    reloadCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus])

  // When course changes, load my userId (from students) and coursework
  useEffect(() => {
    const run = async () => {
      if (!gcSelectedCourseId || !session?.user?.email) return
      try {
        setGcLoading(true)
        setGcError(null)
        // obtain my user profile (works for students without roster permissions)
        const meResp = await fetch(`/api/classroom/users/me`)
        if (!meResp.ok) throw new Error(`HTTP ${meResp.status}`)
        const meData = await meResp.json()
        const myId = meData?.profile?.id || ""
        setGcMyUserId(myId)

        // load coursework for the selected course
        const cwResp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/coursework`)
        if (!cwResp.ok) throw new Error(`HTTP ${cwResp.status}`)
        const cw = await cwResp.json()
        const course = gcCourses.find((c) => c.id === gcSelectedCourseId)
        setGcCoursework(cw.coursework || [])

        // build my tasks by fetching submissions for each coursework and filtering to my userId
        const submissionsPromises = (cw.coursework || []).map(async (w: any) => {
          const subResp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/submissions?courseworkId=${w.id}&userId=${encodeURIComponent(myId || gcMyUserId)}`)
          if (!subResp.ok) return null
          const subs = await subResp.json()
          const mine = (subs.submissions || []).find((s: any) => s.userId === (myId || gcMyUserId))
          return mine
            ? {
                id: String(w.id),
                title: w.title || String(w.id),
                courseId: gcSelectedCourseId,
                courseName: course?.name || gcSelectedCourseId,
                dueDate: w?.dueDate ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, "0")}-${String(w.dueDate.day).padStart(2, "0")}` : undefined,
                state: mine.state,
                late: mine.late,
                assignedGrade: mine.assignedGrade ?? null,
                alternateLink: mine.alternateLink ?? null,
              }
            : {
                id: String(w.id),
                title: w.title || String(w.id),
                courseId: gcSelectedCourseId,
                courseName: course?.name || gcSelectedCourseId,
                dueDate: w?.dueDate ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, "0")}-${String(w.dueDate.day).padStart(2, "0")}` : undefined,
                state: "NO_SUBMISSION",
                late: null,
                assignedGrade: null,
                alternateLink: w.alternateLink ?? null,
              }
        })

        const results = (await Promise.all(submissionsPromises)).filter(Boolean) as any[]
        setGcMyTasks(results)
      } catch (e: any) {
        setGcError(e?.message || "No se pudieron cargar tus tareas")
      } finally {
        setGcLoading(false)
        setBootstrapped(true)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gcSelectedCourseId, session?.user?.email])

  // Generate notifications from student's tasks
  useEffect(() => {
    if (gcMyTasks.length > 0) {
      // Generate notifications for pending and overdue tasks
      const pendingTasks = gcMyTasks.filter(task => task.state === "NO_SUBMISSION" && task.dueDate)
      const overdueTasks = gcMyTasks.filter(task => task.late)
      const gradedTasks = gcMyTasks.filter(task => task.assignedGrade && task.assignedGrade > 0)

      // Notifications for pending tasks with due dates
      pendingTasks.forEach(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          const now = new Date()
          const timeDiff = dueDate.getTime() - now.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

          if (daysDiff <= 3 && daysDiff > 0) {
            addNotification({
              title: "Tarea próxima a vencer",
              message: `La tarea "${task.title}" vence en ${daysDiff} día${daysDiff > 1 ? 's' : ''}`,
              type: "deadline",
              priority: daysDiff === 1 ? "high" : "medium",
              courseworkId: task.id,
              actionUrl: task.alternateLink || undefined,
            })
          }
        }
      })

      // Notifications for overdue tasks
      overdueTasks.forEach(task => {
        addNotification({
          title: "Tarea vencida",
          message: `La tarea "${task.title}" está vencida. ¡Entrégala cuanto antes!`,
          type: "reminder",
          priority: "high",
          courseworkId: task.id,
          actionUrl: task.alternateLink || undefined,
        })
      })

      // Notifications for new grades
      gradedTasks.forEach(task => {
        addNotification({
          title: "Nueva calificación",
          message: `Tu tarea "${task.title}" ha sido calificada: ${task.assignedGrade} puntos`,
          type: "grade",
          priority: "low",
          courseworkId: task.id,
        })
      })
    }
  }, [gcMyTasks, addNotification])

  const handleViewTask = (taskId: string | number) => {
    console.log("[v0] Viewing task:", taskId)
    router.push(`/tasks/${taskId}`)
  }

  const handleJoinClass = (classId: number) => {
    console.log("[v0] Joining class:", classId)
    router.push(`/classes/${classId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-400" />
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-amber-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "in-progress":
        return "En Progreso"
      case "overdue":
        return "Atrasada"
      default:
        return "Pendiente"
    }
  }

  // Normalize tasks to a unified shape for rendering
  type UiTask = {
    id: string
    title: string
    courseId?: string
    courseName?: string
    dueDate?: string
    state?: string | null
    late?: boolean | null
    assignedGrade?: number | null
    alternateLink?: string | null
  }

  const uiTasks: UiTask[] = gcMyTasks.map((t) => ({
    id: String(t.id),
    title: t.title,
    courseId: t.courseId,
    courseName: t.courseName,
    dueDate: t.dueDate,
    state: t.state,
    late: t.late ?? null,
    assignedGrade: t.assignedGrade ?? null,
    alternateLink: t.alternateLink ?? null,
  }))

  // Helper to map UiTask state to filter key
  const toKey = (t: UiTask): "pending" | "in_progress" | "completed" | "overdue" => {
    if (t.state === "TURNED_IN" || t.state === "RETURNED" || t.state === "COMPLETED") return "completed"
    if (t.state === "OVERDUE" || t.late) return "overdue"
    if (t.state === "NO_SUBMISSION" || t.state === "PENDING") return "pending"
    return "in_progress"
  }

  const subjectFiltered =
    selectedSubject === "all" ? uiTasks : uiTasks.filter((task) => (task.courseName || "").toLowerCase().includes(selectedSubject))

  const filteredTasks: UiTask[] =
    statusFilter === "all" ? subjectFiltered : subjectFiltered.filter((t) => toKey(t) === statusFilter)

  const pendingCount = filteredTasks.filter((t) => !isCompleted(t.state)).length
  const myPendingCount = uiTasks.filter((t) => !isCompleted(t.state)).length

  // Progreso general real
  const totalTasks = uiTasks.length
  const completedCount = uiTasks.filter((t) => isCompleted(t.state)).length
  const generalProgressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  // Serie del gráfico "Mi Progreso" basada en tareas reales
  const chartData = buildProgressSeries(gcMyTasks)

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
            <span className="text-sm bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Estudiante</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
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
            <ProfileMenu user={user} onLogout={() => logout()} />
          </div>
        </div>
      </header>

      {/* Filter Bar with Scroll Animation */}
      <div className={`border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4 sticky top-16 z-40 transition-transform duration-300 ease-in-out ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Materia:</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-44 sm:w-48">
                <SelectValue placeholder="Todas las materias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las materias</SelectItem>
                <SelectItem value="desarrollo">Desarrollo Web</SelectItem>
                <SelectItem value="programacion">Programación</SelectItem>
                <SelectItem value="ux">UX/UI</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl font-bold mb-2">¡Hola, {user?.name?.split(" ")[0]}! 👋</h2>
          <p className="text-muted-foreground mb-4">
            {`Tienes ${myPendingCount} tareas por entregar y ${calendarEvents.length} clases próximas.`}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progreso General:</span>
              <Progress value={generalProgressPct} className="w-32" />
              <span className="text-sm font-bold">{generalProgressPct}%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Mis Tareas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary by status */}
              {gcSelectedCourseId && (
                <div className="mt-2 [&>*]:mb-2">
                  <StatusChips items={filteredTasks.map((t) => ({ state: t.state, late: t.late }))} />
                </div>
              )}
              {/* Controls: Curso + Estado */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium" htmlFor="course-select">Curso:</label>
                  <Select value={gcSelectedCourseId} onValueChange={setGcSelectedCourseId}>
                    <SelectTrigger id="course-select" className="w-full sm:w-64" aria-label="Seleccionar curso">
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
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium" htmlFor="status-select">Estado:</label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger id="status-select" className="w-full sm:w-48" aria-label="Filtrar por estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="overdue">Atrasada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={reloadCourses} disabled={gcLoading} aria-label="Actualizar cursos y tareas">
                  {gcLoading ? "Actualizando..." : "Actualizar"}
                </Button>
                {gcError && <span className="text-sm text-destructive" role="alert">{gcError}</span>}
              </div>

              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const key = statusToKey(task.state, task.late ?? null)
                      const iconKey = key === "in_progress" ? "in-progress" : (key as "completed" | "pending" | "overdue")
                      return getStatusIcon(iconKey)
                    })()}
                    <div className="min-w-0">
                      <h3 className="font-medium truncate max-w-[220px] sm:max-w-none">{task.title}</h3>
                      <p className="text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-none">{task.courseName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          const key = statusToKey(task.state, task.late ?? null)
                          const label = statusToLabel(key)
                          const variant = statusToBadgeVariant(key)
                          return (
                            <Badge variant={variant === "default" ? "default" : variant === "destructive" ? "destructive" : "secondary"} className="text-xs">
                              {label}
                            </Badge>
                          )
                        })()}
                        <span className="text-xs text-muted-foreground">
                          {task.dueDate ? `Vence: ${task.dueDate}` : ""}
                        </span>
                        {(() => {
                          if (typeof task.assignedGrade !== "number") return null
                          const work = gcCoursework.find((w) => String(w.id) === String(task.id))
                          return <GradeBadge assigned={task.assignedGrade} maxPoints={(work?.maxPoints as number | null) ?? null} />
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      {task.alternateLink && (
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto text-center" asChild aria-label={`Abrir en Classroom: ${task.title}`}>
                          <a href={task.alternateLink} target="_blank" rel="noreferrer">Abrir en Classroom</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Próximas Entregas (real) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Próximas Entregas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // Build upcoming deliveries from coursework with dueDate in the future and not completed
                const upcoming = gcCoursework
                  .map((w) => {
                    const ui = filteredTasks.find((t) => t.id === String(w.id))
                    const due = w?.dueDate ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, "0")}-${String(w.dueDate.day).padStart(2, "0")}` : undefined
                    return {
                      id: String(w.id),
                      title: w.title || String(w.id),
                      courseName: gcCourses.find((c) => c.id === gcSelectedCourseId)?.name || gcSelectedCourseId,
                      dueDate: due,
                      state: ui?.state,
                      alternateLink: (ui?.alternateLink as string | undefined) || (w as any)?.alternateLink,
                    }
                  })
                  .filter((item) => !!item.dueDate)
                  .filter((item) => {
                    // exclude completed
                    return !(item.state === "TURNED_IN" || item.state === "RETURNED" || item.state === "COMPLETED")
                  })
                  .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
                  .slice(0, 5)

                if (upcoming.length === 0) {
                  return (
                    <div className="text-sm text-muted-foreground">
                      No hay próximas entregas. {gcCoursework.length === 0 && (
                        <>
                          Crea una tarea en <a href="https://classroom.google.com" target="_blank" rel="noreferrer" className="text-primary underline">Classroom</a> y pulsa Actualizar.
                        </>
                      )}
                    </div>
                  )
                }

                return upcoming.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div className="min-w-0">
                        <h3 className="font-medium truncate max-w-[220px] sm:max-w-none">{item.title}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-[220px] sm:max-w-none">{item.courseName}</p>
                        <p className="text-xs text-muted-foreground">Vence: {item.dueDate}</p>
                      </div>
                    </div>
                    {item.alternateLink ? (
                      <a href={item.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline text-sm w-full sm:w-auto text-center" aria-label="Abrir en Classroom (nueva pestaña)">
                        Abrir en Classroom
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                ))
              })()}
            </CardContent>
          </Card>
          {/* Clases próximas (Google Calendar) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Clases próximas (Calendar)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {calendarError ? calendarError : "No hay eventos próximos o no has dado permisos de Calendar."}
                </div>
              ) : (
                calendarEvents.map((ev) => {
                  const start = ev.start ? new Date(ev.start) : null
                  const dateStr = start ? start.toLocaleString() : ""
                  return (
                    <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-border rounded-lg">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate max-w-[240px] sm:max-w-none">{ev.summary}</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[240px] sm:max-w-none">{dateStr}{ev.location ? ` · ${ev.location}` : ""}</p>
                      </div>
                      {ev.hangoutLink ? (
                        <a href={ev.hangoutLink} target="_blank" rel="noreferrer" className="text-primary underline text-sm w-full sm:w-auto text-center">Unirse</a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Mi Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
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
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "var(--foreground)", strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
