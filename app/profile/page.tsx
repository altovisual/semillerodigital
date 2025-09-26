"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/shared/back-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { FullPageSkeleton } from "@/components/shared/full-page-skeleton"
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Settings, 
  Edit, 
  Save, 
  X, 
  BookOpen, 
  Users, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  School,
  GraduationCap,
  UserCheck
} from "lucide-react"

interface ProfileData {
  courses: number
  students: number
  assignments: number
  completionRate: number
  lastAccess: string
  joinDate: string
  totalSubmissions: number
  avgGrade: number
  activeDays: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: session, status: sessionStatus } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [editedName, setEditedName] = useState("")
  const [editedBio, setEditedBio] = useState("")

  const photo = user?.avatar || session?.user?.image || "/placeholder-user.jpg"

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "coordinator": return "default"
      case "teacher": return "secondary"
      case "student": return "outline"
      default: return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "coordinator": return "Coordinador"
      case "teacher": return "Profesor"
      case "student": return "Estudiante"
      default: return role
    }
  }

  // Cargar datos del perfil desde Google Classroom
  useEffect(() => {
    if (sessionStatus === "loading") return
    if (!user) {
      setLoading(false)
      return
    }

    setEditedName(user.name || "")
    setEditedBio("") // En el futuro se podría cargar desde la base de datos

    const loadProfileData = async () => {
      try {
        setLoading(true)
        
        if (sessionStatus === "authenticated") {
          // Cargar datos reales de Google Classroom
          const coursesResp = await fetch("/api/classroom/courses")
          const coursesData = coursesResp.ok ? await coursesResp.json() : { courses: [] }
          const courses = coursesData.courses || []

          let totalStudents = 0
          let totalAssignments = 0
          let totalSubmissions = 0
          let completedSubmissions = 0
          let totalGrades = 0
          let gradeCount = 0

          // Obtener datos agregados de todos los cursos
          for (const course of courses.slice(0, 3)) { // Limitar a 3 cursos para performance
            try {
              // Estudiantes del curso
              const studentsResp = await fetch(`/api/classroom/courses/${course.id}/students`)
              if (studentsResp.ok) {
                const studentsData = await studentsResp.json()
                totalStudents += (studentsData.students || []).length
              }

              // Tareas del curso
              const courseworkResp = await fetch(`/api/classroom/courses/${course.id}/coursework`)
              if (courseworkResp.ok) {
                const courseworkData = await courseworkResp.json()
                const coursework = courseworkData.coursework || []
                totalAssignments += coursework.length

                // Entregas de las tareas
                for (const work of coursework.slice(0, 5)) { // Limitar a 5 tareas por curso
                  try {
                    const submissionsResp = await fetch(`/api/classroom/courses/${course.id}/submissions?courseworkId=${work.id}`)
                    if (submissionsResp.ok) {
                      const submissionsData = await submissionsResp.json()
                      const submissions = submissionsData.submissions || []
                      totalSubmissions += submissions.length
                      
                      submissions.forEach((sub: any) => {
                        if (sub.state === "TURNED_IN" || sub.state === "RETURNED") {
                          completedSubmissions++
                        }
                        if (sub.assignedGrade !== null && sub.assignedGrade !== undefined) {
                          totalGrades += sub.assignedGrade
                          gradeCount++
                        }
                      })
                    }
                  } catch (error) {
                    console.error("Error loading submissions:", error)
                  }
                }
              }
            } catch (error) {
              console.error("Error loading course data:", error)
            }
          }

          const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
          const avgGrade = gradeCount > 0 ? Math.round((totalGrades / gradeCount) * 10) / 10 : 0
          const activeDays = Math.floor(Math.random() * 200) + 50 // Simulado por ahora

          setProfileData({
            courses: courses.length,
            students: user.role === "student" ? 0 : totalStudents,
            assignments: user.role === "student" ? totalSubmissions : totalAssignments,
            completionRate,
            lastAccess: new Date().toLocaleString("es-ES"),
            joinDate: session?.user?.email ? "Enero 2024" : "Usuario invitado",
            totalSubmissions,
            avgGrade,
            activeDays
          })
        } else {
          // Datos de fallback para usuarios no autenticados
          setProfileData({
            courses: 0,
            students: 0,
            assignments: 0,
            completionRate: 0,
            lastAccess: "No disponible",
            joinDate: "Usuario invitado",
            totalSubmissions: 0,
            avgGrade: 0,
            activeDays: 0
          })
        }
      } catch (error) {
        console.error("Error loading profile data:", error)
        // Datos de fallback en caso de error
        setProfileData({
          courses: 0,
          students: 0,
          assignments: 0,
          completionRate: 0,
          lastAccess: "Error al cargar",
          joinDate: "No disponible",
          totalSubmissions: 0,
          avgGrade: 0,
          activeDays: 0
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [user, sessionStatus, session])

  const handleSaveProfile = () => {
    // Aquí se implementaría la lógica para guardar los cambios
    // Por ahora solo actualizamos el estado local
    console.log("Guardando perfil:", { name: editedName, bio: editedBio })
    setIsEditing(false)
    // En una implementación real, aquí haríamos una llamada a la API
  }

  const handleCancelEdit = () => {
    setEditedName(user?.name || "")
    setEditedBio("")
    setIsEditing(false)
  }

  if (loading || sessionStatus === "loading") {
    return <FullPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>

        {user ? (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Información Principal */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photo} alt={user?.name || "Usuario"} />
                      <AvatarFallback className="text-lg">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                              id="name"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Tu nombre completo"
                            />
                          </div>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold">{user.name || "Sin nombre"}</h2>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía (opcional)</Label>
                      <Textarea
                        id="bio"
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        placeholder="Cuéntanos un poco sobre ti..."
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Rol</p>
                        <p className="text-sm text-muted-foreground">{getRoleLabel(user.role)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Miembro desde</p>
                        <p className="text-sm text-muted-foreground">{profileData?.joinDate || "Cargando..."}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p className="text-sm text-green-600">Activo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas del Usuario */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{profileData?.courses || 0}</div>
                      <div className="text-sm text-muted-foreground">Cursos</div>
                    </div>
                    
                    {user.role === "student" ? (
                      <>
                        <div className="text-center p-4 rounded-lg bg-green-500/5">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">{profileData?.completionRate || 0}%</div>
                          <div className="text-sm text-muted-foreground">Tareas Completadas</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-500/5">
                          <div className="flex items-center justify-center mb-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{profileData?.avgGrade || 0}</div>
                          <div className="text-sm text-muted-foreground">Promedio</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-4 rounded-lg bg-green-500/5">
                          <div className="flex items-center justify-center mb-2">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-green-600">{profileData?.students || 0}</div>
                          <div className="text-sm text-muted-foreground">Estudiantes</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-500/5">
                          <div className="flex items-center justify-center mb-2">
                            <School className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{profileData?.assignments || 0}</div>
                          <div className="text-sm text-muted-foreground">Tareas Creadas</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="text-center p-3 rounded-lg bg-orange-500/5">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-lg font-bold text-orange-600">{profileData?.activeDays || 0}</div>
                      <div className="text-xs text-muted-foreground">Días Activo</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-500/5">
                      <div className="flex items-center justify-center mb-2">
                        <UserCheck className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-bold text-purple-600">{profileData?.totalSubmissions || 0}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role === "student" ? "Entregas" : "Total Entregas"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Seguridad
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Notificaciones
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Último acceso</span>
                      <span className="font-medium">{profileData?.lastAccess || "Cargando..."}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {user.role === "student" ? "Tareas entregadas" : "Tareas creadas"}
                      </span>
                      <span className="font-medium">{profileData?.assignments || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Cursos activos</span>
                      <span className="font-medium">{profileData?.courses || 0}</span>
                    </div>
                    {user.role !== "student" && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Estudiantes</span>
                          <span className="font-medium">{profileData?.students || 0}</span>
                        </div>
                      </>
                    )}
                    {user.role === "student" && profileData?.avgGrade && profileData.avgGrade > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Promedio general</span>
                          <Badge variant="outline" className="font-medium">
                            {profileData.avgGrade}/10
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No has iniciado sesión</p>
              <p className="text-muted-foreground mb-4">Inicia sesión para ver tu perfil</p>
              <Button>Iniciar Sesión</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
