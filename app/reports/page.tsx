"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportFilters } from "@/components/reports/report-filters"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import { notificationService } from "@/lib/notification-service"
import { BackButton } from "@/components/shared/back-button"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  const [filters, setFilters] = useState({ role: "student", cohort: "all", course: "all", range: "30d" })

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
    const rows = [
      ["Clase", "Fecha", "Asistencia"],
      ["React Components", "2025-01-12", "88%"],
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "asistencia.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportGradesCsv = () => {
    const rows = [
      ["Estudiante", "Curso", "Nota"],
      ["María González", "JavaScript Avanzado", "9.2"],
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "calificaciones.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Datos mock para gráficos
  const entregasSemana = [
    { week: "Sem 1", onTime: 76 },
    { week: "Sem 2", onTime: 81 },
    { week: "Sem 3", onTime: 78 },
    { week: "Sem 4", onTime: 82 },
    { week: "Sem 5", onTime: 85 },
  ]

  const atrasosPorCohorte = [
    { cohort: "DW-2025Q1", late: 6 },
    { cohort: "DW-2025Q2", late: 4 },
    { cohort: "UX-2025Q1", late: 3 },
  ]

  const asistenciaPorCurso = [
    { course: "JavaScript", attendance: 88 },
    { course: "React", attendance: 91 },
    { course: "Node.js", attendance: 86 },
    { course: "UX/UI", attendance: 90 },
  ]

  // CSV export simple (mock)
  const exportTasksCsv = () => {
    const rows = [
      ["Estudiante", "Tarea", "Estado", "Vencimiento"],
      ["Carlos Rodríguez", "Proyecto Final", "Atrasada", "2025-01-15"],
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tareas.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              <h1 className="text-xl sm:text-2xl font-bold">Reportes y Análisis</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>Exportar PDF</Button>
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
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Entregas a tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">82%</div>
                  <div className="text-xs text-muted-foreground">Últimos 30 días</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Tareas atrasadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">14</div>
                  <div className="text-xs text-muted-foreground">Con prioridad alta: 5</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Asistencia promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">91%</div>
                  <div className="text-xs text-muted-foreground">Semana actual</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alertas y recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Estudiantes con 3+ tareas atrasadas
                  </div>
                  <Badge variant="destructive">Prioridad</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Clases con asistencia por debajo del 75%</div>
                  <Badge variant="secondary">Revisar</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Tendencia negativa esta semana</div>
                  <Badge variant="secondary">Analizar</Badge>
                </div>
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
                      <LineChart data={entregasSemana}>
                        <XAxis dataKey="week" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Line type="monotone" dataKey="onTime" stroke="hsl(var(--primary))" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tareas atrasadas por cohorte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={atrasosPorCohorte}>
                        <XAxis dataKey="cohort" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Bar dataKey="late" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
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
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Tarea</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Carlos Rodríguez</TableCell>
                      <TableCell>Proyecto Final</TableCell>
                      <TableCell>Atrasada</TableCell>
                      <TableCell>2025-01-15</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => sendReminder("Carlos Rodríguez", "Proyecto Final")}>
                          Enviar recordatorio
                        </Button>
                      </TableCell>
                    </TableRow>
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
                    <BarChart data={asistenciaPorCurso}>
                      <XAxis dataKey="course" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clase</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>React Components</TableCell>
                      <TableCell>2025-01-12</TableCell>
                      <TableCell>88%</TableCell>
                    </TableRow>
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
                      <TableHead>Curso</TableHead>
                      <TableHead>Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>María González</TableCell>
                      <TableCell>JavaScript Avanzado</TableCell>
                      <TableCell>9.2</TableCell>
                    </TableRow>
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
