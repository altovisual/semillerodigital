"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportFilters } from "@/components/reports/report-filters"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, CartesianGrid } from "recharts"
import { notificationService } from "@/lib/notification-service"
import { BackButton } from "@/components/shared/back-button"
import { BarChart3, RefreshCw, Database, TestTube } from "lucide-react"
import { useReportsData } from "@/hooks/use-reports-data"
import { useAuth } from "@/contexts/auth-context"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"

export default function ReportsPage() {
  const [filters, setFilters] = useState({ role: "student", cohort: "all", course: "all", range: "30d" })
  const { user } = useAuth()
  const { data, loading, error, isRealData, refetch } = useReportsData(filters)

  const sendReminder = async (studentName: string, taskTitle: string) => {
    try {
      // Demo: usar notificationService existente (requiere email y horas restantes)
      const fakeEmail = `${studentName.toLowerCase().replace(/\s+/g, ".")}@example.com`
      await notificationService.sendTaskReminderNotification(fakeEmail, taskTitle, 24)
      alert(`Recordatorio enviado a ${studentName}`)
    } catch (e: any) {
      alert(e?.message || "No se pudo enviar el recordatorio")
    }
  }

  const exportAttendanceCsv = () => {
    if (!data) return
    
    const rows = [
      ["Curso", "Estudiantes", "Tasa de Finalización", "Promedio"],
      ...data.courseStats.map(course => [
        course.course,
        course.students.toString(),
        `${course.completion}%`,
        course.avgGrade.toFixed(1)
      ])
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `asistencia_${isRealData ? 'real' : 'demo'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportGradesCsv = () => {
    if (!data) return
    
    const rows = [
      ["Estudiante", "Email", "Tareas Totales", "Completadas", "A Tiempo", "Atrasadas", "Promedio"],
      ...data.studentProgress.map(student => [
        student.name,
        student.email,
        student.totalAssignments.toString(),
        student.completed.toString(),
        student.onTime.toString(),
        student.late.toString(),
        student.avgGrade.toFixed(1)
      ])
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `calificaciones_${isRealData ? 'real' : 'demo'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV export para tareas
  const exportTasksCsv = () => {
    if (!data) return
    
    const rows = [
      ["Tarea", "Curso", "Fecha Límite", "Entregas", "A Tiempo", "Atrasadas", "Promedio"],
      ...data.assignments.map(assignment => [
        assignment.title,
        assignment.courseName,
        assignment.dueDate || "Sin fecha",
        assignment.submissions.toString(),
        assignment.onTimeSubmissions.toString(),
        assignment.lateSubmissions.toString(),
        assignment.avgGrade?.toFixed(1) || "Sin calificar"
      ])
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tareas_${isRealData ? 'real' : 'demo'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Mostrar loading si los datos están cargando
  if (loading) {
    return <FullPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Reportes y Análisis</h1>
                <div className="flex items-center gap-2 mt-1">
                  {isRealData ? (
                    <Badge variant="default" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      Datos Reales
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <TestTube className="h-3 w-3 mr-1" />
                      Datos de Prueba
                    </Badge>
                  )}
                  {error && (
                    <Badge variant="destructive" className="text-xs">
                      Error: {error}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Exportar PDF</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportFilters value={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Estudiantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data?.totalStudents || 0}</div>
                  <div className="text-xs text-muted-foreground">Total registrados</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Entregas a tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data?.onTimeRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Últimos {filters.range}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Tasa de finalización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data?.completionRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Tareas completadas</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Promedio general</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{data?.avgGrade?.toFixed(1) || "0.0"}</div>
                  <div className="text-xs text-muted-foreground">Calificación promedio</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alertas y recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.alerts.length ? (
                  data.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm">
                        {alert.description}
                        {alert.count && <span className="ml-2 font-medium">({alert.count})</span>}
                      </div>
                      <Badge variant={
                        alert.priority === "high" ? "destructive" : 
                        alert.priority === "medium" ? "default" : "secondary"
                      }>
                        {alert.title}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No hay alertas disponibles</div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de entregas a tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.weeklyProgress || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="onTime" stroke="hsl(var(--primary))" strokeWidth={3} dot name="A tiempo" />
                        <Line type="monotone" dataKey="late" stroke="hsl(var(--destructive))" strokeWidth={2} dot name="Atrasadas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento por curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.courseStats || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="course" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="completion" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="% Finalización" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Tareas</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportTasksCsv}>Exportar CSV</Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Entregas</TableHead>
                      <TableHead>A Tiempo</TableHead>
                      <TableHead>Atrasadas</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.assignments.length ? (
                      data.assignments.slice(0, 10).map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>{assignment.courseName}</TableCell>
                          <TableCell>{assignment.dueDate || "Sin fecha"}</TableCell>
                          <TableCell>{assignment.submissions}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">
                              {assignment.onTimeSubmissions}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={assignment.lateSubmissions > 0 ? "destructive" : "secondary"} className="text-xs">
                              {assignment.lateSubmissions}
                            </Badge>
                          </TableCell>
                          <TableCell>{assignment.avgGrade?.toFixed(1) || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => sendReminder("Estudiantes", assignment.title)}>
                              Recordatorio
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No hay tareas disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Asistencia</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportAttendanceCsv}>Exportar CSV</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.courseStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="course" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="completion" fill="hsl(var(--primary))" radius={[4,4,0,0]} name="% Finalización" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Finalización</TableHead>
                      <TableHead>Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.courseStats.length ? (
                      data.courseStats.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.course}</TableCell>
                          <TableCell>{course.students}</TableCell>
                          <TableCell>
                            <Badge variant={course.completion >= 80 ? "default" : "secondary"} className="text-xs">
                              {course.completion}%
                            </Badge>
                          </TableCell>
                          <TableCell>{course.avgGrade.toFixed(1)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No hay datos de cursos disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Calificaciones</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportGradesCsv}>Exportar CSV</Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tareas Totales</TableHead>
                      <TableHead>Completadas</TableHead>
                      <TableHead>A Tiempo</TableHead>
                      <TableHead>Atrasadas</TableHead>
                      <TableHead>Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.studentProgress.length ? (
                      data.studentProgress.slice(0, 10).map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-muted-foreground">{student.email}</TableCell>
                          <TableCell>{student.totalAssignments}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">
                              {student.completed}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="text-xs">
                              {student.onTime}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.late > 0 ? "destructive" : "secondary"} className="text-xs">
                              {student.late}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              student.avgGrade >= 8 ? "default" : 
                              student.avgGrade >= 7 ? "secondary" : "destructive"
                            } className="text-xs">
                              {student.avgGrade.toFixed(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No hay datos de estudiantes disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
