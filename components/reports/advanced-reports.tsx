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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Users, Clock, Target, Award, AlertTriangle, User } from "lucide-react"

// Types for real data
interface RealDataProps {
  gcCourses?: Array<{ id?: string | null; name?: string | null; section?: string | null }>
  gcStudents?: Array<{ userId?: string | null; profile?: { name?: string | null; email?: string | null } }>
  gcCoursework?: Array<{ id?: string | null; title?: string | null; maxPoints?: number | null }>
  gcSubmissions?: Array<{ userId?: string | null; state?: string | null; late?: boolean | null; assignedGrade?: number | null }>
  gcAllSubmissions?: Record<string, Array<{ userId?: string | null; state?: string | null; late?: boolean | null }>>
}

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

// Mock data for students at risk by category
const studentsAtRisk = {
  lowAttendance: [
    { name: "Carlos Mendoza", email: "carlos.mendoza@email.com", attendance: 65, lastSeen: "Hace 3 días" },
    { name: "Ana Rodríguez", email: "ana.rodriguez@email.com", attendance: 58, lastSeen: "Hace 5 días" },
    { name: "Luis García", email: "luis.garcia@email.com", attendance: 62, lastSeen: "Hace 2 días" },
    { name: "María Torres", email: "maria.torres@email.com", attendance: 55, lastSeen: "Hace 1 semana" },
    { name: "Pedro Sánchez", email: "pedro.sanchez@email.com", attendance: 68, lastSeen: "Hace 4 días" },
  ],
  lateSubmissions: [
    { name: "Sofia López", email: "sofia.lopez@email.com", lateCount: 5, lastSubmission: "Hace 2 días (tarde)" },
    { name: "Diego Martín", email: "diego.martin@email.com", lateCount: 4, lastSubmission: "Hace 1 día (tarde)" },
    { name: "Carmen Ruiz", email: "carmen.ruiz@email.com", lateCount: 6, lastSubmission: "Hace 3 días (tarde)" },
    { name: "Javier Morales", email: "javier.morales@email.com", lateCount: 4, lastSubmission: "Ayer (tarde)" },
    { name: "Elena Vega", email: "elena.vega@email.com", lateCount: 5, lastSubmission: "Hace 4 días (tarde)" },
    { name: "Roberto Silva", email: "roberto.silva@email.com", lateCount: 3, lastSubmission: "Hace 1 día (tarde)" },
    { name: "Patricia Herrera", email: "patricia.herrera@email.com", lateCount: 7, lastSubmission: "Hace 2 días (tarde)" },
    { name: "Fernando Castro", email: "fernando.castro@email.com", lateCount: 4, lastSubmission: "Ayer (tarde)" },
  ],
  lowGrades: [
    { name: "Miguel Jiménez", email: "miguel.jimenez@email.com", avgGrade: 5.2, lastGrade: "4.5 (Proyecto React)" },
    { name: "Laura Peña", email: "laura.pena@email.com", avgGrade: 5.8, lastGrade: "5.0 (Examen JS)" },
    { name: "Andrés Ramos", email: "andres.ramos@email.com", avgGrade: 4.9, lastGrade: "4.2 (Tarea HTML)" },
  ],
  inactivity: [
    { name: "Cristina Vargas", email: "cristina.vargas@email.com", daysSinceActivity: 10, lastActivity: "Entrega de tarea" },
    { name: "Raúl Ortega", email: "raul.ortega@email.com", daysSinceActivity: 8, lastActivity: "Comentario en foro" },
    { name: "Isabel Guerrero", email: "isabel.guerrero@email.com", daysSinceActivity: 12, lastActivity: "Login al sistema" },
    { name: "Tomás Delgado", email: "tomas.delgado@email.com", daysSinceActivity: 9, lastActivity: "Descarga de material" },
  ]
}

export function AdvancedReports({ 
  compact = false, 
  realData 
}: { 
  compact?: boolean 
  realData?: RealDataProps 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter")
  const [selectedCohort, setSelectedCohort] = useState("all")
  const [reportType, setReportType] = useState("overview")
  const [riskModalOpen, setRiskModalOpen] = useState(false)
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string | null>(null)

  // Calculate real metrics from Google Classroom data
  const calculateRealMetrics = () => {
    if (!realData?.gcStudents || !realData?.gcCoursework || !realData?.gcAllSubmissions) {
      return null
    }

    const totalStudents = realData.gcStudents.length
    const totalCoursework = realData.gcCoursework.length
    
    let totalSubmissions = 0
    let completedSubmissions = 0
    let onTimeSubmissions = 0
    let totalGrades = 0
    let gradeCount = 0

    // Calculate metrics from all submissions
    Object.values(realData.gcAllSubmissions).forEach(submissions => {
      submissions.forEach(sub => {
        totalSubmissions++
        if (sub.state === "TURNED_IN" || sub.state === "RETURNED") {
          completedSubmissions++
          if (!sub.late) {
            onTimeSubmissions++
          }
        }
      })
    })

    // Calculate grades from current submissions
    realData.gcSubmissions?.forEach(sub => {
      if (sub.assignedGrade && sub.assignedGrade > 0) {
        totalGrades += sub.assignedGrade
        gradeCount++
      }
    })

    const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
    const onTimeRate = totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 0
    const avgGrade = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : "N/A"

    return {
      totalStudents,
      completionRate,
      onTimeRate,
      avgGrade
    }
  }

  const realMetrics = calculateRealMetrics()

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`[v0] Exporting report as ${format}`)
    alert(`Exportando reporte como ${format.toUpperCase()}...`)
  }

  const handleRiskCardClick = (category: string) => {
    setSelectedRiskCategory(category)
    setRiskModalOpen(true)
  }

  const getRiskStudents = (category: string) => {
    switch (category) {
      case "lowAttendance":
        return studentsAtRisk.lowAttendance
      case "lateSubmissions":
        return studentsAtRisk.lateSubmissions
      case "lowGrades":
        return studentsAtRisk.lowGrades
      case "inactivity":
        return studentsAtRisk.inactivity
      default:
        return []
    }
  }

  const getRiskCategoryTitle = (category: string) => {
    switch (category) {
      case "lowAttendance":
        return "Estudiantes con Asistencia Baja"
      case "lateSubmissions":
        return "Estudiantes con Entregas Atrasadas"
      case "lowGrades":
        return "Estudiantes con Calificaciones Bajas"
      case "inactivity":
        return "Estudiantes con Inactividad Prolongada"
      default:
        return "Estudiantes en Riesgo"
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Header (hidden when compact) */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Reportes Avanzados</h2>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">Análisis detallado del rendimiento académico</p>
              <Badge variant={realMetrics ? "default" : "secondary"}>
                {realMetrics ? "Datos Reales" : "Datos de Prueba"}
              </Badge>
            </div>
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
              <p className="text-2xl font-bold">{realMetrics?.totalStudents || 65}</p>
              <p className="text-xs text-muted-foreground">
                {realMetrics ? "Datos reales de Google Classroom" : "+8% vs mes anterior"}
              </p>
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
              <p className="text-2xl font-bold">{realMetrics?.completionRate || 87}%</p>
              <p className="text-xs text-muted-foreground">
                {realMetrics ? "Basado en entregas reales" : "+3% vs mes anterior"}
              </p>
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
              <p className="text-2xl font-bold">{realMetrics?.onTimeRate || 82}%</p>
              <p className="text-xs text-muted-foreground">
                {realMetrics ? "Calculado de Google Classroom" : "-2% vs mes anterior"}
              </p>
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
              <p className="text-2xl font-bold">{realMetrics?.avgGrade || "8.2"}</p>
              <p className="text-xs text-muted-foreground">
                {realMetrics ? "Promedio de calificaciones reales" : "+0.3 vs mes anterior"}
              </p>
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
                  <div 
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/50 cursor-pointer hover:bg-red-100/50 transition-colors"
                    onClick={() => handleRiskCardClick("lowAttendance")}
                  >
                    <div>
                      <p className="font-medium text-red-800">Asistencia Baja</p>
                      <p className="text-sm text-red-600">Menos del 70% de asistencia</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">5 estudiantes</Badge>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-amber-50/50 cursor-pointer hover:bg-amber-100/50 transition-colors"
                    onClick={() => handleRiskCardClick("lateSubmissions")}
                  >
                    <div>
                      <p className="font-medium text-amber-800">Entregas Atrasadas</p>
                      <p className="text-sm text-amber-600">Más de 3 entregas tardías</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">8 estudiantes</Badge>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors"
                    onClick={() => handleRiskCardClick("lowGrades")}
                  >
                    <div>
                      <p className="font-medium text-orange-800">Calificaciones Bajas</p>
                      <p className="text-sm text-orange-600">Promedio menor a 6.0</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">3 estudiantes</Badge>
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50/50 cursor-pointer hover:bg-yellow-100/50 transition-colors"
                    onClick={() => handleRiskCardClick("inactivity")}
                  >
                    <div>
                      <p className="font-medium text-yellow-800">Inactividad Prolongada</p>
                      <p className="text-sm text-yellow-600">Sin actividad por más de 7 días</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">4 estudiantes</Badge>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
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

      {/* Modal de Estudiantes en Riesgo */}
      <Dialog open={riskModalOpen} onOpenChange={setRiskModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {selectedRiskCategory ? getRiskCategoryTitle(selectedRiskCategory) : "Estudiantes en Riesgo"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRiskCategory && (
              <div className="grid gap-3">
                {getRiskStudents(selectedRiskCategory).map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {selectedRiskCategory === "lowAttendance" && (
                        <>
                          <p className="text-sm font-medium text-red-600">{(student as any).attendance}% asistencia</p>
                          <p className="text-xs text-muted-foreground">{(student as any).lastSeen}</p>
                        </>
                      )}
                      {selectedRiskCategory === "lateSubmissions" && (
                        <>
                          <p className="text-sm font-medium text-amber-600">{(student as any).lateCount} entregas tardías</p>
                          <p className="text-xs text-muted-foreground">{(student as any).lastSubmission}</p>
                        </>
                      )}
                      {selectedRiskCategory === "lowGrades" && (
                        <>
                          <p className="text-sm font-medium text-orange-600">Promedio: {(student as any).avgGrade}</p>
                          <p className="text-xs text-muted-foreground">{(student as any).lastGrade}</p>
                        </>
                      )}
                      {selectedRiskCategory === "inactivity" && (
                        <>
                          <p className="text-sm font-medium text-yellow-600">{(student as any).daysSinceActivity} días inactivo</p>
                          <p className="text-xs text-muted-foreground">{(student as any).lastActivity}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Acciones Recomendadas</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {selectedRiskCategory === "lowAttendance" && (
                  <>
                    <p>• Contactar a los estudiantes para conocer las razones de su ausencia</p>
                    <p>• Ofrecer sesiones de recuperación o material adicional</p>
                    <p>• Implementar un sistema de seguimiento personalizado</p>
                  </>
                )}
                {selectedRiskCategory === "lateSubmissions" && (
                  <>
                    <p>• Enviar recordatorios automáticos antes de las fechas límite</p>
                    <p>• Revisar la carga de trabajo y plazos de entrega</p>
                    <p>• Ofrecer sesiones de organización y gestión del tiempo</p>
                  </>
                )}
                {selectedRiskCategory === "lowGrades" && (
                  <>
                    <p>• Programar sesiones de tutoría individual</p>
                    <p>• Revisar el material de estudio y metodología</p>
                    <p>• Considerar evaluaciones adicionales o proyectos de recuperación</p>
                  </>
                )}
                {selectedRiskCategory === "inactivity" && (
                  <>
                    <p>• Contactar inmediatamente para verificar el estado del estudiante</p>
                    <p>• Ofrecer apoyo técnico si hay problemas de acceso</p>
                    <p>• Implementar check-ins regulares para mantener el engagement</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
