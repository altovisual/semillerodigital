"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, LogOut, User, Bell, Calendar, FileText, Users, BarChart3, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, CartesianGrid } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { statusToKey, statusToLabel, statusToBadgeVariant } from "@/lib/classroom-status"
import { StatusChips } from "@/components/shared/status-chips"
import { GradeBadge } from "@/components/shared/grade-badge"
import { useSession } from "next-auth/react"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { AdvancedReports } from "@/components/reports/advanced-reports"
import { notificationService } from "@/lib/notification-service"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileMenu } from "@/components/profile-menu"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"
import { UserAvatar } from "@/components/shared/user-avatar"
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

// Mock data for the coordinator dashboard
const studentData = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    avatar: "/placeholder-w3xp6.png",
    progress: 85,
    onTime: 12,
    late: 2,
    missing: 1,
    cohort: "Desarrollo Web - 2025 Q1",
  },
  {
    id: 2,
    name: "María González",
    avatar: "/student-maria.png",
    progress: 92,
    onTime: 15,
    late: 1,
    missing: 0,
    cohort: "Desarrollo Web - 2025 Q1",
  },
  {
    id: 3,
    name: "Juan Pérez",
    avatar: "/placeholder-y1fn1.png",
    progress: 78,
    onTime: 10,
    late: 3,
    missing: 2,
    cohort: "Diseño UX/UI - 2025 Q1",
  },
  {
    id: 4,
    name: "Ana Martínez",
    avatar: "/student-ana.jpg",
    progress: 95,
    onTime: 18,
    late: 0,
    missing: 0,
    cohort: "Data Science - 2024 Q4",
  },
  {
    id: 5,
    name: "Diego López",
    avatar: "/student-diego.jpg",
    progress: 67,
    onTime: 8,
    late: 4,
    missing: 3,
    cohort: "Desarrollo Web - 2025 Q1",
  },
  {
    id: 6,
    name: "Sofia Herrera",
    avatar: "/student-sofia.jpg",
    progress: 88,
    onTime: 14,
    late: 2,
    missing: 1,
    cohort: "Diseño UX/UI - 2025 Q1",
  },
]

const deliveryStatusData = [
  { name: "A Tiempo", value: 77, color: "hsl(var(--success))" },
  { name: "Atrasadas", value: 12, color: "hsl(var(--warning))" },
  { name: "Faltantes", value: 7, color: "hsl(var(--destructive))" },
]

const attendanceData = [
  { week: "Sem 1", attendance: 88 },
  { week: "Sem 2", attendance: 92 },
  { week: "Sem 3", attendance: 89 },
  { week: "Sem 4", attendance: 94 },
]

type FilterType = "Todos" | "Entregado" | "Atrasado" | "Faltante" | "Pendiente"
const FILTERS: FilterType[] = ["Todos", "Entregado", "Atrasado", "Faltante", "Pendiente"]

export function CoordinatorDashboard() {
  const [selectedCohort, setSelectedCohort] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("Todos")
  const [activeTab, setActiveTab] = useState("overview")
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { user, logout, switchRole } = useAuth()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  // Classroom live data state
  const [gcCourses, setGcCourses] = useState<Array<{ id?: string | null; name?: string | null; section?: string | null; ownerId?: string | null }>>([])
  const [gcSelectedCourseId, setGcSelectedCourseId] = useState<string>("")
  const [gcStudents, setGcStudents] = useState<Array<{ userId?: string | null; profile?: { id?: string | null; name?: string | null; email?: string | null; photoUrl?: string | null } }>>([])
  const [gcLoading, setGcLoading] = useState(false)
  const [gcError, setGcError] = useState<string | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [gcCoursework, setGcCoursework] = useState<Array<{ id?: string | null; title?: string | null; maxPoints?: number | null }>>([])
  const [gcSelectedWorkId, setGcSelectedWorkId] = useState<string>("")
  const [gcSubmissions, setGcSubmissions] = useState<Array<{ id?: string | null; userId?: string | null; state?: string | null; late?: boolean | null; assignedGrade?: number | null; alternateLink?: string | null; updateTime?: string | null }>>([])
  const [gcAllSubmissions, setGcAllSubmissions] = useState<Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>>>({});
  
  // Paginación
  const [subPage, setSubPage] = useState<number>(1)
  const [stuPage, setStuPage] = useState<number>(1)
  const pageSize = 20
  
  const cohortOptions = gcCourses
    .filter((c) => !selectedTeacher || (c.ownerId ? c.ownerId === selectedTeacher : true))
    .map((c) => ({
      id: String(c.id || ""),
      label: `${c.name || c.id}${c.section ? ` - ${c.section}` : ""}`,
    }))
  const [gcTeachers, setGcTeachers] = useState<Array<{ userId?: string | null; profile?: { name?: string | null; email?: string | null } }>>([])

  // Derivados de paginación (entregas)
  const totalSubs = gcSubmissions.length
  const totalSubPages = Math.max(1, Math.ceil((totalSubs || 0) / pageSize))
  const safeSubPage = Math.min(Math.max(1, subPage), totalSubPages)
  const subStart = (safeSubPage - 1) * pageSize
  const subEnd = Math.min(subStart + pageSize, totalSubs)
  const paginatedSubs = gcSubmissions.slice(subStart, subEnd)

  // Derivados de paginación (estudiantes)
  const totalStudents = gcStudents.length
  const totalStuPages = Math.max(1, Math.ceil((totalStudents || 0) / pageSize))
  const safeStuPage = Math.min(Math.max(1, stuPage), totalStuPages)
  const stuStart = (safeStuPage - 1) * pageSize
  const stuEnd = Math.min(stuStart + pageSize, totalStudents)
  const paginatedStudents = gcStudents.slice(stuStart, stuEnd)

  // Load Classroom courses helper
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

  // Load Classroom courses when authenticated
  useEffect(() => {
    if (sessionStatus !== "authenticated") return
    reloadCourses()
  }, [sessionStatus])

  // Load students when course changes
  useEffect(() => {
    if (!gcSelectedCourseId) return
    const loadStudentsAndCoursework = async () => {
      try {
        setGcLoading(true)
        setGcError(null)
        // teachers
        const tResp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/teachers`).catch(() => null)
        if (tResp && tResp.ok) {
          const tData = await tResp.json()
          setGcTeachers(tData.teachers || [])
        } else {
          setGcTeachers([])
        }
        const resp = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/students`)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        setGcStudents(data.students || [])

        // Also load coursework for this course
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

        // Load submissions for all coursework to aggregate per-student progress
        const allSubs: Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>> = {}
        await Promise.all((cwData.coursework || []).map(async (w: any) => {
          const r = await fetch(`/api/classroom/courses/${gcSelectedCourseId}/submissions?courseworkId=${w.id}`)
          if (!r.ok) return
          const json = await r.json()
          allSubs[String(w.id)] = (json.submissions || []).map((s: any) => ({ userId: s.userId, state: s.state, late: s.late }))
        }))
        setGcAllSubmissions(allSubs)
      } catch (e: any) {
        setGcError(e?.message || "No se pudieron cargar los alumnos")
      } finally {
        setGcLoading(false)
        setBootstrapped(true)
      }
    }
    loadStudentsAndCoursework()
  }, [gcSelectedCourseId])

  // Load submissions when coursework changes
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

  // Reset de página al cambiar filtros clave
  useEffect(() => { setSubPage(1) }, [gcSelectedWorkId, gcSelectedCourseId])
  useEffect(() => { setStuPage(1) }, [gcSelectedCourseId])

  const handleSendNotification = async (studentId: number) => {
    console.log("[v0] Sending notification to student:", studentId)

    const student = studentData.find((s) => s.id === studentId)
    if (student) {
      try {
        await notificationService.sendTaskReminderNotification(
          `${student.name.toLowerCase().replace(" ", ".")}@email.com`,
          "Tarea pendiente",
          24,
        )
        alert("Notificación enviada exitosamente")
      } catch (error) {
        alert("Error al enviar notificación")
      }
    }
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

  const filteredStudents = studentData.filter((student) => {
    if (selectedCohort && student.cohort !== selectedCohort) return false
    if (activeFilter === "Entregado" && student.missing > 0) return false
    if (activeFilter === "Atrasado" && student.late === 0) return false
    if (activeFilter === "Faltante" && student.missing === 0) return false
    if (activeFilter === "Pendiente" && (student.missing === 0 && student.late === 0)) return false
    return true
  });

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-balance">Semillero Digital Tracker</h1>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">Coordinador</span>
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
            <Users className="h-4 w-4 mr-2" />
            Resumen
          </Button>
          <Button variant={activeTab === "reports" ? "secondary" : "ghost"} onClick={() => setActiveTab("reports")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes Avanzados
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Classroom Live Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Classroom (en vivo)</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Haz click en cualquier fila de alumno para ver su perfil en Google Classroom
                </p>
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
                      Crea o únete a un curso en
                      {" "}
                      <a
                        href="https://classroom.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        classroom.google.com
                      </a>
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

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Email</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gcLoading ? (
                            <TableRow>
                              <TableCell colSpan={2}>
                                <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
                              </TableCell>
                            </TableRow>
                          ) : gcStudents.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2}>
                                <span className="text-sm text-muted-foreground">No hay alumnos para este curso.</span>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedStudents.map((s, idx) => {
                              const fullName = s.profile?.name || s.userId || ""
                              const email = s.profile?.email || ""
                              return (
                                <TableRow 
                                  key={s.userId || s.profile?.email || s.profile?.id || idx}
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
                                  <TableCell>
                                    <span className="text-sm text-muted-foreground">{email}</span>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                      {/* Paginación de estudiantes */}
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

                    {/* Coursework and submissions */}
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

                    {/* Status summary for selected coursework */}
                    {gcSelectedWorkId && (
                      <StatusChips items={gcSubmissions.map((s) => ({ state: s.state, late: s.late }))} className="mt-2" />
                    )}

                    {/* Filtros Mejorados - Responsive */}
                    <div className="bg-card/50 rounded-lg border p-4 space-y-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 w-1 bg-primary rounded-full"></div>
                        <h3 className="text-sm font-semibold text-foreground">Filtros de Búsqueda</h3>
                      </div>
                      
                      {/* Filtros de Selección */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cohorte</label>
                          <Select value={gcSelectedCourseId} onValueChange={(v) => { setGcSelectedCourseId(v); setSelectedCohort(v) }}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccionar cohorte" />
                            </SelectTrigger>
                            <SelectContent>
                              {cohortOptions.map((o) => (
                                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profesor</label>
                          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={gcTeachers.length > 0 ? "Seleccionar profesor" : "No disponible"} />
                            </SelectTrigger>
                            <SelectContent>
                              {gcTeachers.map((t, idx) => (
                                <SelectItem key={t.userId || String(idx)} value={t.userId || String(idx)}>
                                  {t.profile?.name || t.profile?.email || t.userId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado de Entregas</label>
                          <div className="flex flex-wrap gap-2">
                            {FILTERS.map((f) => (
                              <Button 
                                key={f} 
                                variant={activeFilter === f ? "default" : "outline"} 
                                size="sm" 
                                onClick={() => setActiveFilter(f)}
                                className="text-xs px-3 py-1.5 h-auto"
                              >
                                {f}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de Filtros Activos */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Filtros activos:</span>
                        {gcSelectedCourseId && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                            Cohorte: {cohortOptions.find(o => o.id === gcSelectedCourseId)?.label || 'Seleccionado'}
                          </span>
                        )}
                        {selectedTeacher && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs">
                            Profesor: {gcTeachers.find(t => t.userId === selectedTeacher)?.profile?.name || 'Seleccionado'}
                          </span>
                        )}
                        {activeFilter !== "Todos" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs">
                            Estado: {activeFilter}
                          </span>
                        )}
                        {(!gcSelectedCourseId && !selectedTeacher && activeFilter === "Todos") && (
                          <span className="text-xs text-muted-foreground italic">Ninguno</span>
                        )}
                      </div>
                    </div>

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
                            (() => {
                              const work = gcCoursework.find((w) => String(w.id) === String(gcSelectedWorkId)) as any
                              const rows = gcStudents.map((stu, idx) => {
                                const sub = gcSubmissions.find((s) => s.userId === stu.userId)
                                const state = sub?.state || "NO_SUBMISSION"
                                const late = sub?.late || false
                                const key = statusToKey(state, late)
                                const label = statusToLabel(key)
                                const variant = statusToBadgeVariant(key)
                                return {
                                  key: sub?.id || `${stu.userId || "u"}-${idx}`,
                                  name: stu.profile?.name || stu.userId || "-",
                                  email: stu.profile?.email || "-",
                                  state,
                                  late,
                                  label,
                                  variant,
                                  assignedGrade: sub?.assignedGrade ?? null,
                                  link: sub?.alternateLink || null,
                                  work,
                                }
                              })

                              const filtered = rows.filter((r) => {
                                if (activeFilter === "Todos") return true
                                if (activeFilter === "Entregado") return r.state === "TURNED_IN" || r.state === "RETURNED"
                                if (activeFilter === "Atrasado") return !!r.late
                                if (activeFilter === "Faltante") return r.state === "NO_SUBMISSION"
                                if (activeFilter === "Pendiente") return r.state !== "TURNED_IN" && r.state !== "RETURNED" && r.state !== "NO_SUBMISSION"
                                return true
                              })

                              // Aplicar paginación a los resultados filtrados
                              const totalFilteredSubs = filtered.length
                              const totalFilteredSubPages = Math.max(1, Math.ceil(totalFilteredSubs / pageSize))
                              const safeFilteredSubPage = Math.min(Math.max(1, subPage), totalFilteredSubPages)
                              const filteredSubStart = (safeFilteredSubPage - 1) * pageSize
                              const filteredSubEnd = Math.min(filteredSubStart + pageSize, totalFilteredSubs)
                              const paginatedFiltered = filtered.slice(filteredSubStart, filteredSubEnd)

                              return paginatedFiltered.map((r) => (
                                <TableRow key={r.key}>
                                  <TableCell>{r.name}</TableCell>
                                  <TableCell><span className="text-sm text-muted-foreground">{r.email}</span></TableCell>
                                  <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${r.variant === "default" ? "bg-primary text-primary-foreground border-transparent" : r.variant === "destructive" ? "text-destructive border-destructive/40" : "text-muted-foreground border-border"}`}>
                                      {r.label}
                                    </span>
                                  </TableCell>
                                  <TableCell>{r.late ? "Sí" : "No"}</TableCell>
                                  <TableCell>
                                    <GradeBadge assigned={r.assignedGrade} maxPoints={(r.work?.maxPoints as number | null) ?? null} />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      {r.link ? (
                                        <a href={r.link} target="_blank" rel="noreferrer" className="text-primary underline" title="Abrir en Classroom" aria-label="Abrir entrega en Google Classroom (nueva pestaña)">Abrir</a>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            })()
                          )}
                        </TableBody>
                      </Table>
                      {/* Paginación de entregas */}
                      {(() => {
                        const work = gcCoursework.find((w) => String(w.id) === String(gcSelectedWorkId)) as any
                        const rows = gcStudents.map((stu, idx) => {
                          const sub = gcSubmissions.find((s) => s.userId === stu.userId)
                          const state = sub?.state || "NO_SUBMISSION"
                          const late = sub?.late || false
                          return { state, late }
                        })
                        const filtered = rows.filter((r) => {
                          if (activeFilter === "Todos") return true
                          if (activeFilter === "Entregado") return r.state === "TURNED_IN" || r.state === "RETURNED"
                          if (activeFilter === "Atrasado") return !!r.late
                          if (activeFilter === "Faltante") return r.state === "NO_SUBMISSION"
                          if (activeFilter === "Pendiente") return r.state !== "TURNED_IN" && r.state !== "RETURNED" && r.state !== "NO_SUBMISSION"
                          return true
                        })
                        const totalFilteredSubs = filtered.length
                        const totalFilteredSubPages = Math.max(1, Math.ceil(totalFilteredSubs / pageSize))
                        const safeFilteredSubPage = Math.min(Math.max(1, subPage), totalFilteredSubPages)
                        const filteredSubStart = (safeFilteredSubPage - 1) * pageSize
                        const filteredSubEnd = Math.min(filteredSubStart + pageSize, totalFilteredSubs)
                        
                        return totalFilteredSubs > pageSize ? (
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Mostrando {filteredSubStart + 1}–{filteredSubEnd} de {totalFilteredSubs}</span>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" disabled={safeFilteredSubPage <= 1} onClick={() => setSubPage((p: number) => Math.max(1, p - 1))}>Anterior</Button>
                              <span className="text-sm">Página {safeFilteredSubPage} / {totalFilteredSubPages}</span>
                              <Button variant="outline" size="sm" disabled={safeFilteredSubPage >= totalFilteredSubPages} onClick={() => setSubPage((p: number) => Math.min(totalFilteredSubPages, p + 1))}>Siguiente</Button>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            

            {/* Quick Actions (live data) */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Estudiantes</p>
                    <p className="text-2xl font-bold">{gcStudents.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Tareas del Curso</p>
                    <p className="text-2xl font-bold">{gcCoursework.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Pendientes (Tarea seleccionada)</p>
                    <p className="text-2xl font-bold">{gcSelectedWorkId ? gcSubmissions.filter((s) => !(s.state === "TURNED_IN" || s.state === "RETURNED")).length : 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center gap-3 p-4">
                  <Bell className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Course ID</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[10rem]">{gcSelectedCourseId || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Progress Table (live aggregated) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Seguimiento de Progreso de Alumnos</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Haz click en cualquier fila para ver el perfil del alumno en Google Classroom
                </p>
              </CardHeader>
              <CardContent>
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
                          <span className="text-sm text-muted-foreground">No hay alumnos para este curso.</span>
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
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{email}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Progress value={pct} className="w-20" />
                                <span className="text-sm font-medium">{pct}%</span>
                              </div>
                            </TableCell>
                            <TableCell><span className="text-green-400 font-medium">{completed}</span></TableCell>
                            <TableCell><span className="text-amber-400 font-medium">{overdue}</span></TableCell>
                            <TableCell><span className="text-red-400 font-medium">{pending}</span></TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
                {/* Paginación de estudiantes (progreso) */}
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
              </CardContent>
            </Card>
            {/* Quick Reports */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-balance">Reportes Rápidos</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Delivery Status Chart (Donut mejorado) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-balance">Estado General de Entregas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      let completed = 0
                      let overdue = 0
                      let pending = 0
                      for (const w of gcCoursework) {
                        const subs = gcAllSubmissions[String(w.id)] || []
                        for (const s of subs) {
                          if (s.state === "TURNED_IN" || s.state === "RETURNED") completed++
                          else if (s.late) overdue++
                          else pending++
                        }
                      }
                      const total = completed + overdue + pending
                      const data = [
                        { name: "Completadas", value: completed, color: "hsl(var(--success))" },
                        { name: "Atrasadas", value: overdue, color: "hsl(var(--warning))" },
                        { name: "Pendientes", value: pending, color: "hsl(var(--destructive))" },
                      ]
                      return (
                        <div className="h-64 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip formatter={(v: any, n: string) => [`${v}`, n]} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)' }} />
                              <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                              <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                                {data.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{total}</div>
                              <div className="text-xs text-muted-foreground">Total entregas</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Estados por Tarea (Barras Apiladas) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-balance">Estados por Tarea</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Construye dataset por tarea
                      const rows = (gcCoursework || []).slice(0, 8).map((w) => {
                        const subs = gcAllSubmissions[String(w.id)] || []
                        let completed = 0, overdue = 0, pending = 0
                        for (const s of subs) {
                          if (s.state === "TURNED_IN" || s.state === "RETURNED") completed++
                          else if (s.late) overdue++
                          else pending++
                        }
                        return { name: w.title || String(w.id), Completadas: completed, Atrasadas: overdue, Pendientes: pending }
                      })
                      if (rows.length === 0) return <div className="text-sm text-muted-foreground">No hay tareas para este curso.</div>
                      return (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rows} margin={{ left: 8, right: 8 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} stroke="var(--border)" hide={false} interval={0} angle={-15} textAnchor="end" height={60} />
                              <YAxis stroke="var(--border)" tick={{ fill: 'var(--muted-foreground)' }} />
                              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} labelStyle={{ color: 'var(--muted-foreground)' }} />
                              <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                              <Bar dataKey="Completadas" stackId="a" fill="hsl(var(--success))" />
                              <Bar dataKey="Atrasadas" stackId="a" fill="hsl(var(--warning))" />
                              <Bar dataKey="Pendientes" stackId="a" fill="hsl(var(--destructive))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && <AdvancedReports compact />}
      </main>
    </div>
  )
}