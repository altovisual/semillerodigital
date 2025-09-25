"use client"

import { useState } from "react"
import { Bell, Mail, MessageCircle, Send, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Notification {
  id: string
  title: string
  message: string
  type: "task" | "reminder" | "grade" | "attendance" | "system"
  priority: "low" | "medium" | "high"
  timestamp: Date
  read: boolean
  userId: string
}

interface NotificationSettings {
  email: boolean
  whatsapp: boolean
  telegram: boolean
  taskUpdates: boolean
  reminders: boolean
  grades: boolean
  attendance: boolean
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nueva tarea asignada",
    message: "Se ha asignado una nueva tarea: Proyecto Final React",
    type: "task",
    priority: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    userId: "3",
  },
  {
    id: "2",
    title: "Recordatorio de entrega",
    message: "La tarea 'Ejercicios JavaScript' vence mañana",
    type: "reminder",
    priority: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    userId: "3",
  },
  {
    id: "3",
    title: "Calificación disponible",
    message: "Tu tarea 'Diseño de Wireframes' ha sido calificada: 9.5/10",
    type: "grade",
    priority: "low",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    userId: "3",
  },
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    whatsapp: false,
    telegram: false,
    taskUpdates: true,
    reminders: true,
    grades: true,
    attendance: true,
  })
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return <AlertCircle className="h-4 w-4 text-blue-400" />
      case "reminder":
        return <Bell className="h-4 w-4 text-amber-400" />
      case "grade":
        return <Check className="h-4 w-4 text-green-400" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `hace ${minutes} min`
    if (hours < 24) return `hace ${hours}h`
    return `hace ${days}d`
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificaciones</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Marcar todas como leídas
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="mt-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-2 p-4">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No hay notificaciones</div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              notification.read ? "bg-muted/30" : "bg-accent/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                                  <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Marcar como leída
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <div className="p-4 space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Canales de Notificación</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <Switch
                            id="email"
                            checked={settings.email}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, email: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                          </div>
                          <Switch
                            id="whatsapp"
                            checked={settings.whatsapp}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, whatsapp: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            <Label htmlFor="telegram">Telegram</Label>
                          </div>
                          <Switch
                            id="telegram"
                            checked={settings.telegram}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, telegram: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Tipos de Notificación</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskUpdates">Actualizaciones de Tareas</Label>
                          <Switch
                            id="taskUpdates"
                            checked={settings.taskUpdates}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, taskUpdates: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reminders">Recordatorios</Label>
                          <Switch
                            id="reminders"
                            checked={settings.reminders}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, reminders: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="grades">Calificaciones</Label>
                          <Switch
                            id="grades"
                            checked={settings.grades}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, grades: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="attendance">Asistencia</Label>
                          <Switch
                            id="attendance"
                            checked={settings.attendance}
                            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, attendance: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">Guardar Configuración</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
