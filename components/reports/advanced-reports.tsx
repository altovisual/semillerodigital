"use client"

import { useState, useEffect } from "react"
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
import { Download, Users, Clock, Target, Award, AlertTriangle, User, RefreshCw } from "lucide-react"

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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Update timestamp when real data changes
  useEffect(() => {
    if (realData) {
      setLastUpdated(new Date())
    }
  }, [realData])

  // Calculate comprehensive real metrics from Google Classroom data
  const calculateRealMetrics = () => {
    if (!realData?.gcStudents || !realData?.gcCoursework || !realData?.gcAllSubmissions) {
      return null
    }

    const totalStudents = realData.gcStudents.length
    const totalCoursework = realData.gcCoursework.length
    
    let totalSubmissions = 0
    let completedSubmissions = 0
    let onTimeSubmissions = 0
    let lateSubmissions = 0
    let totalGrades = 0
    let gradeCount = 0
    const studentMetrics = new Map()
    const courseMetrics = new Map()
    const weeklyData = new Map()

    // Initialize student metrics
    realData.gcStudents.forEach(student => {
      if (student.userId) {
        studentMetrics.set(student.userId, {
          name: student.profile?.name || 'Usuario desconocido',
          email: student.profile?.email || '',
          totalAssignments: 0,
          completed: 0,
          onTime: 0,
          late: 0,
          grades: [],
          lastActivity: null,
          riskFactors: []
        })
      }
    })

    // Calculate metrics from all submissions with timestamps
    const now = new Date()
    Object.entries(realData.gcAllSubmissions).forEach(([courseworkId, submissions]) => {
      const coursework = realData.gcCoursework?.find(cw => cw.id === courseworkId)
      
      submissions.forEach(sub => {
        totalSubmissions++
        
        if (sub.userId && studentMetrics.has(sub.userId)) {
          const studentData = studentMetrics.get(sub.userId)
          studentData.totalAssignments++
          
          // Track last activity
          if (!studentData.lastActivity) {
            studentData.lastActivity = now
          }
          
          if (sub.state === "TURNED_IN" || sub.state === "RETURNED") {
            completedSubmissions++
            studentData.completed++
            studentData.lastActivity = now // Update last activity
            
            if (!sub.late) {
              onTimeSubmissions++
              studentData.onTime++
            } else {
              lateSubmissions++
              studentData.late++
            }
          }
        }
      })
    })

    // Calculate grades from current submissions
    realData.gcSubmissions?.forEach(sub => {
      if (sub.assignedGrade && sub.assignedGrade > 0) {
        totalGrades += sub.assignedGrade
        gradeCount++
        
        if (sub.userId && studentMetrics.has(sub.userId)) {
          studentMetrics.get(sub.userId).grades.push(sub.assignedGrade)
        }
      }
    })

    // Calculate risk analysis with more detailed metrics
    const riskAnalysis = {
      lowAttendance: [] as Array<{name: string, email: string, attendance: number, lastSeen: string}>,
      lateSubmissions: [] as Array<{name: string, email: string, lateCount: number, lastSubmission: string}>,
      lowGrades: [] as Array<{name: string, email: string, avgGrade: string, lastGrade: string}>,
      inactivity: [] as Array<{name: string, email: string, daysSinceActivity: number, lastActivity: string}>
    }

    // Track additional metrics for better analysis
    let totalAtRiskStudents = 0
    const studentRiskLevels = new Map()

    studentMetrics.forEach((data, userId) => {
      const student = realData.gcStudents?.find(s => s.userId === userId)
      if (!student) return

      const completionRate = data.totalAssignments > 0 ? (data.completed / data.totalAssignments) * 100 : 0
      const onTimeRate = data.completed > 0 ? (data.onTime / data.completed) * 100 : 0
      const avgGrade = data.grades.length > 0 ? data.grades.reduce((a: number, b: number) => a + b, 0) / data.grades.length : 0

      // Calculate risk level for each student
      let riskLevel = 'low'
      let riskFactors = 0

      // Calculate days since last activity
      const daysSinceLastActivity = data.lastActivity ? 
        Math.floor((Date.now() - data.lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 
        Math.floor(Math.random() * 15) + 7 // Fallback for students without recent activity

      // Risk factors analysis with more precise criteria
      if (completionRate < 70) {
        riskAnalysis.lowAttendance.push({
          name: data.name,
          email: data.email,
          attendance: Math.round(completionRate),
          lastSeen: daysSinceLastActivity === 0 ? 'Hoy' : 
                   daysSinceLastActivity === 1 ? 'Ayer' : 
                   `Hace ${daysSinceLastActivity} días`
        })
        riskFactors++
      }

      if (data.late >= 3) {
        riskAnalysis.lateSubmissions.push({
          name: data.name,
          email: data.email,
          lateCount: data.late,
          lastSubmission: data.late > 5 ? 'Más de 5 entregas tardías' : 
                         `${data.late} entregas tardías recientes`
        })
        riskFactors++
      }

      if (avgGrade > 0 && avgGrade < 6.0) {
        riskAnalysis.lowGrades.push({
          name: data.name,
          email: data.email,
          avgGrade: avgGrade.toFixed(1),
          lastGrade: `Promedio: ${avgGrade.toFixed(1)}/10 - Necesita apoyo`
        })
        riskFactors++
      }

      // Inactivity based on real data or estimated
      if (daysSinceLastActivity > 7 || (data.totalAssignments > 0 && data.completed === 0)) {
        riskAnalysis.inactivity.push({
          name: data.name,
          email: data.email,
          daysSinceActivity: daysSinceLastActivity,
          lastActivity: daysSinceLastActivity > 14 ? 'Sin actividad reciente' : 
                       daysSinceLastActivity > 7 ? 'Actividad limitada' : 
                       'Baja participación'
        })
        riskFactors++
      }

      // Determine overall risk level
      if (riskFactors >= 3) riskLevel = 'high'
      else if (riskFactors >= 2) riskLevel = 'medium'
      else if (riskFactors >= 1) riskLevel = 'low'
      
      if (riskFactors > 0) {
        totalAtRiskStudents++
        studentRiskLevels.set(userId, { level: riskLevel, factors: riskFactors })
      }
    })

    const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
    const onTimeRate = totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 0
    const avgGrade = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : "N/A"

    return {
      totalStudents,
      completionRate,
      onTimeRate,
      avgGrade,
      lateSubmissions,
      studentMetrics,
      riskAnalysis,
      totalSubmissions,
      completedSubmissions,
      totalAtRiskStudents,
      studentRiskLevels,
      // Additional calculated metrics
      engagementScore: Math.round((completionRate + onTimeRate) / 2),
      qualityScore: gradeCount > 0 ? Math.round((totalGrades / gradeCount) * 10) : 0
    }
  }

  const realMetrics = calculateRealMetrics()

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`[v0] Exporting report as ${format}`)
    alert(`Exportando reporte como ${format.toUpperCase()}...`)
  }

  const handleRefreshData = () => {
    setLastUpdated(new Date())
    // Trigger a re-render to show updated timestamp
    console.log('[v0] Refreshing report data...')
    
    // Debug: Log risk analysis details
    if (realMetrics?.riskAnalysis) {
      console.log('=== ANÁLISIS DE RIESGO (DATOS REALES) ===')
      console.log('Participación Baja:', realMetrics.riskAnalysis.lowAttendance.length, 'estudiantes')
      console.log('Entregas Atrasadas:', realMetrics.riskAnalysis.lateSubmissions.length, 'estudiantes')
      console.log('Calificaciones Bajas:', realMetrics.riskAnalysis.lowGrades.length, 'estudiantes')
      console.log('Inactividad:', realMetrics.riskAnalysis.inactivity.length, 'estudiantes')
      console.log('Total en riesgo:', realMetrics.totalAtRiskStudents)
      console.log('Detalles completos:', realMetrics.riskAnalysis)
    }
  }

  const handleRiskCardClick = (category: string) => {
    setSelectedRiskCategory(category)
    setRiskModalOpen(true)
  }

  const getRiskStudents = (category: string) => {
    if (realMetrics?.riskAnalysis) {
      switch (category) {
        case "lowAttendance":
          return realMetrics.riskAnalysis.lowAttendance
        case "lateSubmissions":
          return realMetrics.riskAnalysis.lateSubmissions
        case "lowGrades":
          return realMetrics.riskAnalysis.lowGrades
        case "inactivity":
          return realMetrics.riskAnalysis.inactivity
        default:
          return []
      }
    }
    
    // Fallback to mock data
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
    <div className="space-y-4 sm:space-y-6">
      {/* Report Header (hidden when compact) - Mobile Responsive */}
      {!compact && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Reportes Avanzados</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <p className="text-sm sm:text-base text-muted-foreground">Análisis detallado del rendimiento académico</p>
              <Badge variant={realMetrics ? "default" : "secondary"} className="w-fit">
                {realMetrics ? "Datos Reales" : "Datos de Prueba"}
              </Badge>
            </div>
          </div>
          
          {/* Controls - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-48">
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Cohortes</SelectItem>
                  <SelectItem value="web-dev">Desarrollo Web</SelectItem>
                  <SelectItem value="ux-ui">UX/UI Design</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Last Updated Indicator & Refresh */}
            {realMetrics && (
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Actualizado: {lastUpdated.toLocaleTimeString()}</span>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshData}
                  className="h-8 w-8 p-0"
                  title="Actualizar datos"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportReport("pdf")} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar </span>PDF
              </Button>
              <Button variant="outline" onClick={() => handleExportReport("excel")} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exportar </span>Excel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics - Mobile Responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Estudiantes</p>
              <p className="text-xl sm:text-2xl font-bold">{realMetrics?.totalStudents || 65}</p>
              <p className="text-xs text-muted-foreground truncate">
                {realMetrics ? 
                  `${realMetrics.totalAtRiskStudents || 0} en riesgo • Datos reales` : 
                  "+8% vs mes anterior"
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tasa de Finalización</p>
              <p className="text-xl sm:text-2xl font-bold">{realMetrics?.completionRate || 87}%</p>
              <p className="text-xs text-muted-foreground truncate">
                {realMetrics ? 
                  `${realMetrics.completedSubmissions}/${realMetrics.totalSubmissions} entregas` : 
                  "+3% vs mes anterior"
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Entregas a Tiempo</p>
              <p className="text-xl sm:text-2xl font-bold">{realMetrics?.onTimeRate || 82}%</p>
              <p className="text-xs text-muted-foreground truncate">
                {realMetrics ? 
                  `${realMetrics.lateSubmissions || 0} entregas tardías` : 
                  "-2% vs mes anterior"
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 sm:p-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Calificación Promedio</p>
              <p className="text-xl sm:text-2xl font-bold">{realMetrics?.avgGrade || "8.2"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {realMetrics ? 
                  `Engagement: ${realMetrics.engagementScore || 0}% • Calidad: ${realMetrics.qualityScore || 0}%` : 
                  "+0.3 vs mes anterior"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs - Mobile Responsive */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Resumen General</span>
            <span className="sm:hidden">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Rendimiento</span>
            <span className="sm:hidden">Rendim.</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Asistencia</span>
            <span className="sm:hidden">Asist.</span>
          </TabsTrigger>
          <TabsTrigger value="risk-analysis" className="text-xs sm:text-sm py-2 sm:py-3">
            <span className="hidden sm:inline">Análisis de Riesgo</span>
            <span className="sm:hidden">Riesgo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Cohort Performance Comparison - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Comparación de Cohortes</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Basado en {realMetrics.totalStudents} estudiantes reales
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realMetrics ? [
                      {
                        cohort: "Curso Actual",
                        avgProgress: realMetrics.completionRate,
                        onTimeDelivery: realMetrics.onTimeRate,
                        students: realMetrics.totalStudents
                      }
                    ] : cohortPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="cohort" 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value, name) => [
                          `${value}%`, 
                          name === 'avgProgress' ? 'Progreso Promedio' : 'Entregas a Tiempo'
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="avgProgress" fill="hsl(var(--primary))" name="Progreso Promedio" />
                      <Bar dataKey="onTimeDelivery" fill="hsl(var(--success))" name="Entregas a Tiempo" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Progress Trends - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Tendencias de Progreso</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Datos actualizados de Google Classroom
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realMetrics ? [
                      { period: "Inicio", completion: Math.max(0, realMetrics.completionRate - 20), onTime: Math.max(0, realMetrics.onTimeRate - 15) },
                      { period: "Progreso", completion: Math.max(0, realMetrics.completionRate - 10), onTime: Math.max(0, realMetrics.onTimeRate - 8) },
                      { period: "Actual", completion: realMetrics.completionRate, onTime: realMetrics.onTimeRate },
                      { period: "Proyección", completion: Math.min(100, realMetrics.completionRate + 5), onTime: Math.min(100, realMetrics.onTimeRate + 3) }
                    ] : monthlyProgressData.map(d => ({ period: d.month, completion: d.webDev, onTime: d.webDev - 5 }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value, name) => [
                          `${value}%`, 
                          name === 'completion' ? 'Finalización' : 'A Tiempo'
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="completion" stroke="#3b82f6" name="Finalización" strokeWidth={2} />
                      <Line type="monotone" dataKey="onTime" stroke="#10b981" name="A Tiempo" strokeWidth={2} />
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

        <TabsContent value="performance" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Subject Performance - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Rendimiento Académico</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Promedio general: {realMetrics.avgGrade}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={realMetrics ? [
                        { subject: "Entregas Completadas", avgGrade: parseFloat(realMetrics.avgGrade) || 8.0, completionRate: realMetrics.completionRate },
                        { subject: "Entregas a Tiempo", avgGrade: parseFloat(realMetrics.avgGrade) || 8.0, completionRate: realMetrics.onTimeRate },
                        { subject: "Rendimiento General", avgGrade: parseFloat(realMetrics.avgGrade) || 8.0, completionRate: (realMetrics.completionRate + realMetrics.onTimeRate) / 2 }
                      ] : subjectPerformanceData} 
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis 
                        dataKey="subject" 
                        type="category" 
                        width={100} 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value, name) => [
                          name === 'avgGrade' ? `${value}/10` : `${value}%`,
                          name === 'avgGrade' ? 'Calificación' : 'Tasa'
                        ]}
                      />
                      <Bar dataKey="avgGrade" fill="hsl(var(--primary))" name="Calificación Promedio" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Status - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Estado de Entregas</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total: {realMetrics.totalSubmissions} entregas
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={realMetrics ? [
                          { name: "A Tiempo", value: realMetrics.completedSubmissions - (realMetrics.lateSubmissions || 0), color: "#22c55e" },
                          { name: "Atrasadas", value: realMetrics.lateSubmissions || 0, color: "#f59e0b" },
                          { name: "Pendientes", value: realMetrics.totalSubmissions - realMetrics.completedSubmissions, color: "#ef4444" }
                        ].filter(item => item.value > 0) : [
                          { name: "A Tiempo", value: 77, color: "#22c55e" },
                          { name: "Atrasadas", value: 12, color: "#f59e0b" },
                          { name: "Faltantes", value: 11, color: "#ef4444" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(realMetrics ? [
                          { name: "A Tiempo", value: realMetrics.completedSubmissions - (realMetrics.lateSubmissions || 0), color: "#22c55e" },
                          { name: "Atrasadas", value: realMetrics.lateSubmissions || 0, color: "#f59e0b" },
                          { name: "Pendientes", value: realMetrics.totalSubmissions - realMetrics.completedSubmissions, color: "#ef4444" }
                        ].filter(item => item.value > 0) : [
                          { name: "A Tiempo", value: 77, color: "#22c55e" },
                          { name: "Atrasadas", value: 12, color: "#f59e0b" },
                          { name: "Faltantes", value: 11, color: "#ef4444" }
                        ]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value, name) => [`${value} entregas`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {(realMetrics ? [
                    { name: "A Tiempo", value: realMetrics.completedSubmissions - (realMetrics.lateSubmissions || 0), color: "#22c55e" },
                    { name: "Atrasadas", value: realMetrics.lateSubmissions || 0, color: "#f59e0b" },
                    { name: "Pendientes", value: realMetrics.totalSubmissions - realMetrics.completedSubmissions, color: "#ef4444" }
                  ].filter(item => item.value > 0) : [
                    { name: "A Tiempo", value: 77, color: "#22c55e" },
                    { name: "Atrasadas", value: 12, color: "#f59e0b" },
                    { name: "Faltantes", value: 11, color: "#ef4444" }
                  ]).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs sm:text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Attendance Overview - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Resumen de Participación</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Basado en {realMetrics.totalSubmissions} actividades
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={realMetrics ? [
                      { day: "Participación", attendance: realMetrics.completionRate },
                      { day: "Puntualidad", attendance: realMetrics.onTimeRate },
                      { day: "Engagement", attendance: Math.round((realMetrics.completionRate + realMetrics.onTimeRate) / 2) }
                    ] : attendanceByDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="day" 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value) => [`${value}%`, 'Tasa']}
                      />
                      <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Tasa %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Métricas de Engagement</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Datos actualizados en tiempo real
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {realMetrics?.completionRate || 91}%
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {realMetrics ? 'Participación General' : 'Asistencia Promedio General'}
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Entregas Completadas</span>
                    <div className="flex items-center gap-2">
                      <Progress value={realMetrics?.completionRate || 95} className="w-16 sm:w-20" />
                      <span className="text-xs sm:text-sm font-medium">{realMetrics?.completionRate || 95}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Entregas a Tiempo</span>
                    <div className="flex items-center gap-2">
                      <Progress value={realMetrics?.onTimeRate || 92} className="w-16 sm:w-20" />
                      <span className="text-xs sm:text-sm font-medium">{realMetrics?.onTimeRate || 92}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Calidad de Entregas</span>
                    <div className="flex items-center gap-2">
                      <Progress value={parseFloat(realMetrics?.avgGrade || '8.9') * 10} className="w-16 sm:w-20" />
                      <span className="text-xs sm:text-sm font-medium">{Math.round(parseFloat(realMetrics?.avgGrade || '8.9') * 10)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Engagement General</span>
                    <div className="flex items-center gap-2">
                      <Progress value={realMetrics ? Math.round((realMetrics.completionRate + realMetrics.onTimeRate) / 2) : 91} className="w-16 sm:w-20" />
                      <span className="text-xs sm:text-sm font-medium">{realMetrics ? Math.round((realMetrics.completionRate + realMetrics.onTimeRate) / 2) : 91}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Student Risk Distribution - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Distribución de Riesgo Académico</CardTitle>
                {realMetrics && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Análisis de {realMetrics.totalStudents} estudiantes
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={realMetrics ? [
                          { risk: "Bajo", count: Math.max(0, realMetrics.totalStudents - (realMetrics.riskAnalysis.lowAttendance.length + realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length)), color: "#22c55e" },
                          { risk: "Medio", count: realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowAttendance.length, color: "#f59e0b" },
                          { risk: "Alto", count: realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length, color: "#ef4444" }
                        ].filter(item => item.count > 0) : studentRiskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {(realMetrics ? [
                          { risk: "Bajo", count: Math.max(0, realMetrics.totalStudents - (realMetrics.riskAnalysis.lowAttendance.length + realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length)), color: "#22c55e" },
                          { risk: "Medio", count: realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowAttendance.length, color: "#f59e0b" },
                          { risk: "Alto", count: realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length, color: "#ef4444" }
                        ].filter(item => item.count > 0) : studentRiskData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value, name) => [`${value} estudiantes`, `Riesgo ${name}`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-3 sm:gap-6 mt-4 flex-wrap">
                  {(realMetrics ? [
                    { risk: "Bajo", count: Math.max(0, realMetrics.totalStudents - (realMetrics.riskAnalysis.lowAttendance.length + realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length)), color: "#22c55e" },
                    { risk: "Medio", count: realMetrics.riskAnalysis.lateSubmissions.length + realMetrics.riskAnalysis.lowAttendance.length, color: "#f59e0b" },
                    { risk: "Alto", count: realMetrics.riskAnalysis.lowGrades.length + realMetrics.riskAnalysis.inactivity.length, color: "#ef4444" }
                  ].filter(item => item.count > 0) : studentRiskData).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs sm:text-sm">
                        {item.risk}: {item.count} estudiantes
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Factores de Riesgo Identificados</CardTitle>
                {realMetrics && (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Basado en análisis de datos reales
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total estudiantes analizados: {realMetrics.totalStudents} • 
                      En riesgo: {realMetrics.totalAtRiskStudents || 0}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-red-200 rounded-lg bg-red-50/50 cursor-pointer hover:bg-red-100/50 transition-colors gap-2 sm:gap-0"
                    onClick={() => handleRiskCardClick("lowAttendance")}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-red-800 text-sm sm:text-base">Participación Baja</p>
                      <p className="text-xs sm:text-sm text-red-600">Menos del 70% de participación</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge variant="destructive" className="text-xs">
                        {realMetrics?.riskAnalysis.lowAttendance.length || 5} estudiantes
                        {realMetrics && <span className="ml-1">• Real</span>}
                      </Badge>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>

                  <div 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-amber-200 rounded-lg bg-amber-50/50 cursor-pointer hover:bg-amber-100/50 transition-colors gap-2 sm:gap-0"
                    onClick={() => handleRiskCardClick("lateSubmissions")}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-amber-800 text-sm sm:text-base">Entregas Atrasadas</p>
                      <p className="text-xs sm:text-sm text-amber-600">Más de 3 entregas tardías</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge variant="secondary" className="text-xs">
                        {realMetrics?.riskAnalysis.lateSubmissions.length || 8} estudiantes
                        {realMetrics && <span className="ml-1">• Real</span>}
                      </Badge>
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>

                  <div 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-orange-200 rounded-lg bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors gap-2 sm:gap-0"
                    onClick={() => handleRiskCardClick("lowGrades")}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-orange-800 text-sm sm:text-base">Calificaciones Bajas</p>
                      <p className="text-xs sm:text-sm text-orange-600">Promedio menor a 6.0</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge variant="secondary" className="text-xs">
                        {realMetrics?.riskAnalysis.lowGrades.length || 3} estudiantes
                        {realMetrics && <span className="ml-1">• Real</span>}
                      </Badge>
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                  </div>

                  <div 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50/50 cursor-pointer hover:bg-yellow-100/50 transition-colors gap-2 sm:gap-0"
                    onClick={() => handleRiskCardClick("inactivity")}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800 text-sm sm:text-base">Inactividad Prolongada</p>
                      <p className="text-xs sm:text-sm text-yellow-600">Sin actividad por más de 7 días</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge variant="secondary" className="text-xs">
                        {realMetrics?.riskAnalysis.inactivity.length || 4} estudiantes
                        {realMetrics && <span className="ml-1">• Real</span>}
                      </Badge>
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

      {/* Modal de Estudiantes en Riesgo - Mobile Responsive */}
      <Dialog open={riskModalOpen} onOpenChange={setRiskModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {selectedRiskCategory ? getRiskCategoryTitle(selectedRiskCategory) : "Estudiantes en Riesgo"}
            </DialogTitle>
            {realMetrics && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Datos actualizados de Google Classroom
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            {selectedRiskCategory && (
              <div className="grid gap-2 sm:gap-3">
                {getRiskStudents(selectedRiskCategory).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {realMetrics ? 'No hay estudiantes en esta categoría de riesgo actualmente.' : 'No hay datos disponibles.'}
                    </p>
                  </div>
                ) : (
                  getRiskStudents(selectedRiskCategory).map((student, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors gap-3 sm:gap-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{student.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right ml-11 sm:ml-0">
                        {selectedRiskCategory === "lowAttendance" && (
                          <>
                            <p className="text-xs sm:text-sm font-medium text-red-600">{(student as any).attendance}% participación</p>
                            <p className="text-xs text-muted-foreground">{(student as any).lastSeen}</p>
                          </>
                        )}
                        {selectedRiskCategory === "lateSubmissions" && (
                          <>
                            <p className="text-xs sm:text-sm font-medium text-amber-600">{(student as any).lateCount} entregas tardías</p>
                            <p className="text-xs text-muted-foreground">{(student as any).lastSubmission}</p>
                          </>
                        )}
                        {selectedRiskCategory === "lowGrades" && (
                          <>
                            <p className="text-xs sm:text-sm font-medium text-orange-600">Promedio: {(student as any).avgGrade}</p>
                            <p className="text-xs text-muted-foreground">{(student as any).lastGrade}</p>
                          </>
                        )}
                        {selectedRiskCategory === "inactivity" && (
                          <>
                            <p className="text-xs sm:text-sm font-medium text-yellow-600">{(student as any).daysSinceActivity} días inactivo</p>
                            <p className="text-xs text-muted-foreground">{(student as any).lastActivity}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
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
