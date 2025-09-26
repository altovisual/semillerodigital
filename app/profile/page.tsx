"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/shared/back-button"
import { User, Mail, Shield, Calendar, Settings, Edit } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: session } = useSession()

  const photo = user?.avatar || session?.user?.image || "/placeholder-user.jpg"
  const joinDate = "Enero 2025" // Mock data - en producción vendría de la base de datos

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
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
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">{user.name || "Sin nombre"}</h2>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                  
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
                        <p className="text-sm text-muted-foreground">{joinDate}</p>
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
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center p-4 rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-muted-foreground">Cursos Activos</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-500/5">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-sm text-muted-foreground">Tareas Completadas</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-500/5">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-muted-foreground">Días Activo</div>
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
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Último acceso</span>
                      <span>Hoy, 14:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tareas enviadas</span>
                      <span>3 esta semana</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cursos visitados</span>
                      <span>5 hoy</span>
                    </div>
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
