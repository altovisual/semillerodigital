"use client"

import { NotificationCenter } from "@/components/notifications/notification-center"
import { BackButton } from "@/components/shared/back-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, Filter, CheckCheck } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar como leídas
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">No leídas</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Importantes</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Esta semana</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Centro de notificaciones mejorado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Recientes
              </CardTitle>
              <Badge variant="secondary">8 nuevas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <NotificationCenter />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
