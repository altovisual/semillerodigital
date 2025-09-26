"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, LogOut, User, FileText, Users, BookOpen, Clock, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react"
import { statusToKey, statusToLabel, statusToBadgeVariant } from "@/lib/classroom-status"
import { StatusChips } from "@/components/shared/status-chips"
import { GradeBadge } from "@/components/shared/grade-badge"
import Link from "next/link"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ProfileMenu } from "@/components/profile-menu"
import { CalendarIntegration } from "@/components/calendar/calendar-integration"
import { UserAvatar } from "@/components/shared/user-avatar"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
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
  const [bootstrapped, setBootstrapped] = useState(false)

  // Classroom live data state
  const [gcCourses, setGcCourses] = useState<Array<{ id?: string | null; name?: string | null }>>([])
  const [gcSelectedCourseId, setGcSelectedCourseId] = useState<string>("")
  const [gcStudents, setGcStudents] = useState<Array<{ userId?: string | null; profile?: { id?: string | null; name?: string | null; email?: string | null; photoUrl?: string | null } }>>([])
  const [gcCoursework, setGcCoursework] = useState<Array<{ id?: string | null; title?: string | null; maxPoints?: number | null }>>([])
  const [gcSelectedWorkId, setGcSelectedWorkId] = useState<string>("")
  const [gcSubmissions, setGcSubmissions] = useState<Array<{ id?: string | null; userId?: string | null; state?: string | null; late?: boolean | null; assignedGrade?: number | null; alternateLink?: string | null; updateTime?: string | null }>>([])
  const [gcLoading, setGcLoading] = useState(false)
  const [gcError, setGcError] = useState<string | null>(null)
  const [gcAllSubmissions, setGcAllSubmissions] = useState<Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>>>({})

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

  const handleGradeAssignment = (studentId: number) => {
    console.log("[v0] Grading assignment for student:", studentId)
    router.push(`/students/${studentId}/grade`)
  }

  const handleSendReminder = (studentId: number) => {
    console.log("[v0] Sending reminder to student:", studentId)
    router.push(`/notifications?studentId=${studentId}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:h-16 sm:items-center sm:justify-between px-4 sm:px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-balance">Semillero Digital Tracker</h1>
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

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card px-4 sm:px-6 py-3 sm:py-4">
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

                    <div className="flex items-center gap-3 flex-wrap pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Tarea:</label>
                        <Select value={gcSelectedWorkId} onValueChange={setGcSelectedWorkId}>
                          <SelectTrigger className="w-80">
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

                    {/* Review Table: submissions */}
                    <div className="overflow-x-auto">
                      <Table>
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
                            gcSubmissions.map((sub) => {
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
                                      {gcSelectedCourseId && gcSelectedWorkId && (
                                        <Link href={`/classroom/tasks/${gcSelectedCourseId}/${gcSelectedWorkId}`} className="text-sm underline">
                                          Ver detalle
                                        </Link>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
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
                        gcStudents.map((s) => {
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
                            <TableRow key={s.userId || email}>
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
