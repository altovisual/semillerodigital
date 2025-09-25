"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Users, Clock, Target, Award } from "lucide-react"

// Mock data for advanced reports
const cohortPerformanceData = [
  {
    cohort: "Desarrollo Web Q1",
    students: 25,
    avgProgress: 85,
    onTimeDelivery: 78,
    attendance: 92,
    satisfaction: 4.2,
  },
  {
    cohort: "UX/UI Design Q1",
    students: 18,
    avgProgress: 91,
    onTimeDelivery: 85,
    attendance: 89,
    satisfaction: 4.5,
  },
  {
    cohort: "Data Science Q4",
    students: 22,
    avgProgress: 76,
    onTimeDelivery: 71,
    attendance: 87,
    satisfaction: 4.0,
  },
]

const monthlyProgressData = [
  { month: "Sep", webDev: 65, uxui: 70, dataScience: 60 },
  { month: "Oct", webDev: 72, uxui: 78, dataScience: 68 },
  { month: "Nov", webDev: 78, uxui: 85, dataScience: 74 },
  { month: "Dec", webDev: 85, uxui: 91, dataScience: 76 },
]

const deliveryTrendsData = [
  { week: "Sem 1", onTime: 85, late: 12, missing: 3 },
  { week: "Sem 2", onTime: 78, late: 15, missing: 7 },
  { week: "Sem 3", onTime: 82, late: 13, missing: 5 },
  { week: "Sem 4", onTime: 88, late: 9, missing: 3 },
  { week: "Sem 5", onTime: 91, late: 7, missing: 2 },
]

const subjectPerformanceData = [
  { subject: "JavaScript", avgGrade: 8.5, completionRate: 92 },
  { subject: "React", avgGrade: 8.2, completionRate: 88 },
  { subject: "Node.js", avgGrade: 7.8, completionRate: 85 },
  { subject: "Databases", avgGrade: 7.5, completionRate: 82 },
  { subject: "UI/UX", avgGrade: 8.8, completionRate: 95 },
]

const attendanceByDayData = [
  { day: "Lun", attendance: 95 },
  { day: "Mar", attendance: 92 },
  { day: "Mié", attendance: 89 },
  { day: "Jue", attendance: 91 },
  { day: "Vie", attendance: 87 },
]

const studentRiskData = [
  { risk: "Bajo", count: 45, color: "#22c55e" },
  { risk: "Medio", count: 12, color: "#f59e0b" },
  { risk: "Alto", count: 8, color: "#ef4444" },
]

export function AdvancedReports({ compact = false }: { compact?: boolean }) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter")
  const [selectedCohort, setSelectedCohort] = useState("all")
  const [reportType, setReportType] = useState("overview")

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`[v0] Exporting report as ${format}`)
    alert(`Exportando reporte como ${format.toUpperCase()}...`)
  }

  return (
    <div className="space-y-6">
      {/* Report Header (hidden when compact) */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Reportes Avanzados</h2>
            <p className="text-muted-foreground">Análisis detallado del rendimiento académico</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-quarter">Trimestre Actual</SelectItem>
                <SelectItem value="last-quarter">Trimestre Anterior</SelectItem>
                <SelectItem value="current-year">Año Actual</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Cohortes</SelectItem>
                <SelectItem value="web-dev">Desarrollo Web</SelectItem>
                <SelectItem value="ux-ui">UX/UI Design</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Estudiantes</p>
              <p className="text-2xl font-bold">65</p>
              <p className="text-xs text-green-500">+8% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasa de Finalización</p>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-green-500">+3% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entregas a Tiempo</p>
              <p className="text-2xl font-bold">82%</p>
              <p className="text-xs text-red-500">-2% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Award className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Calificación Promedio</p>
              <p className="text-2xl font-bold">8.2</p>
              <p className="text-xs text-green-500">+0.3 vs mes anterior</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          <TabsTrigger value="risk-analysis">Análisis de Riesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cohort Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Cohortes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cohortPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cohort" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgProgress" fill="hsl(var(--primary))" name="Progreso Promedio" />
                      <Bar dataKey="onTimeDelivery" fill="hsl(var(--success))" name="Entregas a Tiempo" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Progress Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Progreso Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="webDev" stroke="#3b82f6" name="Desarrollo Web" strokeWidth={2} />
                      <Line type="monotone" dataKey="uxui" stroke="#10b981" name="UX/UI" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="dataScience"
                        stroke="#f59e0b"
                        name="Data Science"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cohort Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles por Cohorte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohortPerformanceData.map((cohort, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{cohort.cohort}</h3>
                      <Badge variant="outline">{cohort.students} estudiantes</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Progreso Promedio</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={cohort.avgProgress} className="flex-1" />
                          <span className="text-sm font-medium">{cohort.avgProgress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Entregas a Tiempo</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={cohort.onTimeDelivery} className="flex-1" />
                          <span className="text-sm font-medium">{cohort.onTimeDelivery}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Asistencia</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={cohort.attendance} className="flex-1" />
                          <span className="text-sm font-medium">{cohort.attendance}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfacción</p>
                        <p className="text-lg font-bold text-primary">{cohort.satisfaction}/5.0</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Materia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPerformanceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="subject" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="avgGrade" fill="hsl(var(--primary))" name="Calificación Promedio" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={deliveryTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="onTime"
                        stackId="1"
                        stroke="#22c55e"
                        fill="#22c55e"
                        name="A Tiempo"
                      />
                      <Area
                        type="monotone"
                        dataKey="late"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        name="Atrasadas"
                      />
                      <Area
                        type="monotone"
                        dataKey="missing"
                        stackId="1"
                        stroke="#ef4444"
                        fill="#ef4444"
                        name="Faltantes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Asistencia por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceByDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Asistencia %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Asistencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">91%</div>
                  <p className="text-muted-foreground">Asistencia Promedio General</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lunes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-20" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Martes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Miércoles</span>
                    <div className="flex items-center gap-2">
                      <Progress value={89} className="w-20" />
                      <span className="text-sm font-medium">89%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Jueves</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Viernes</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="w-20" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Student Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Riesgo Académico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentRiskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {studentRiskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {studentRiskData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">
                        {item.risk}: {item.count} estudiantes
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Factores de Riesgo Identificados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50">
                    <div>
                      <p className="font-medium text-red-800">Asistencia Baja</p>
                      <p className="text-sm text-red-600">Menos del 70% de asistencia</p>
                    </div>
                    <Badge variant="destructive">5 estudiantes</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-amber-50/50">
                    <div>
                      <p className="font-medium text-amber-800">Entregas Atrasadas</p>
                      <p className="text-sm text-amber-600">Más de 3 entregas tardías</p>
                    </div>
                    <Badge variant="secondary">8 estudiantes</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50/50">
                    <div>
                      <p className="font-medium text-orange-800">Calificaciones Bajas</p>
                      <p className="text-sm text-orange-600">Promedio menor a 6.0</p>
                    </div>
                    <Badge variant="secondary">3 estudiantes</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50/50">
                    <div>
                      <p className="font-medium text-yellow-800">Inactividad Prolongada</p>
                      <p className="text-sm text-yellow-600">Sin actividad por más de 7 días</p>
                    </div>
                    <Badge variant="secondary">4 estudiantes</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Recomendaciones</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Implementar seguimiento personalizado para estudiantes de alto riesgo</li>
                    <li>• Enviar recordatorios automáticos para entregas pendientes</li>
                    <li>• Programar sesiones de tutoría adicionales</li>
                    <li>• Revisar metodología de enseñanza para materias con bajo rendimiento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
