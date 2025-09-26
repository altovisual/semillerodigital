"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Mail, MessageCircle, Send, X, Check, AlertCircle, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/contexts/notifications-context"

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return <AlertCircle className="h-4 w-4 text-blue-400" />
      case "reminder":
        return <Bell className="h-4 w-4 text-amber-400" />
      case "grade":
        return <Award className="h-4 w-4 text-green-400" />
      case "deadline":
        return <Clock className="h-4 w-4 text-red-400" />
      case "attendance":
        return <Check className="h-4 w-4 text-purple-400" />
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
        <div 
          ref={modalRef}
          className="absolute right-0 top-full mt-2 w-96 z-50 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-4 border-b border-border/50 bg-gradient-to-r from-background/50 to-background/30 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-muted-foreground">{unreadCount} sin leer</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs h-8 px-3 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Marcar todas
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-0">
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 border-0 rounded-none border-b border-border/50">
                  <TabsTrigger 
                    value="notifications" 
                    className="data-[state=active]:bg-background/80 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Notificaciones
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-background/80 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                  >
                    Configuración
                  </TabsTrigger>
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
                            className={`group p-4 rounded-xl border border-border/30 transition-all duration-200 hover:shadow-md ${
                              notification.read 
                                ? "bg-background/40 backdrop-blur-sm" 
                                : "bg-gradient-to-r from-primary/5 to-accent/10 backdrop-blur-sm border-primary/20 shadow-sm"
                            } hover:bg-background/60 hover:border-border/50`}
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
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {notification.actionUrl && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          window.open(notification.actionUrl, '_blank', 'noopener,noreferrer')
                                          markAsRead(notification.id)
                                        }}
                                        className="h-7 px-3 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/20 rounded-lg transition-colors"
                                      >
                                        Ver
                                      </Button>
                                    )}
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(notification.id)}
                                        className="h-7 px-3 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
                                      >
                                        Marcar leída
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
                    <div className="bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        Canales de Notificación
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <Switch
                            id="email"
                            checked={settings.email}
                            onCheckedChange={(checked) => updateSettings({ email: checked })}
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
                            onCheckedChange={(checked) => updateSettings({ whatsapp: checked })}
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
                            onCheckedChange={(checked) => updateSettings({ telegram: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm border border-border/30 rounded-xl p-4">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                          <Bell className="h-4 w-4 text-primary" />
                        </div>
                        Tipos de Notificación
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="taskUpdates">Actualizaciones de Tareas</Label>
                          <Switch
                            id="taskUpdates"
                            checked={settings.taskUpdates}
                            onCheckedChange={(checked) => updateSettings({ taskUpdates: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reminders">Recordatorios</Label>
                          <Switch
                            id="reminders"
                            checked={settings.reminders}
                            onCheckedChange={(checked) => updateSettings({ reminders: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="grades">Calificaciones</Label>
                          <Switch
                            id="grades"
                            checked={settings.grades}
                            onCheckedChange={(checked) => updateSettings({ grades: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="attendance">Asistencia</Label>
                          <Switch
                            id="attendance"
                            checked={settings.attendance}
                            onCheckedChange={(checked) => updateSettings({ attendance: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="deadlines">Fechas Límite</Label>
                          <Switch
                            id="deadlines"
                            checked={settings.deadlines}
                            onCheckedChange={(checked) => updateSettings({ deadlines: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                      Guardar Configuración
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
