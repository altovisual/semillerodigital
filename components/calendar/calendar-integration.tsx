"use client"

import { useState } from "react"
import { Calendar, Clock, Users, MapPin, Video, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingUrl?: string
  attendees: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    status: "accepted" | "declined" | "pending" | "attended" | "absent"
  }>
  teacher: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  cohort: string
  subject: string
  type: "class" | "workshop" | "exam" | "meeting"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
}

// Mock calendar events data
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Introducción a variables, funciones y objetos en JavaScript",
    startTime: new Date(2025, 0, 15, 9, 0), // January 15, 2025, 9:00 AM
    endTime: new Date(2025, 0, 15, 11, 0), // January 15, 2025, 11:00 AM
    location: "Aula Virtual 1",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    teacher: {
      id: "2",
      name: "Juan Pérez",
      email: "juan.perez@semillero.com",
      avatar: "/placeholder-w3xp6.png",
    },
    cohort: "Desarrollo Web - 2025 Q1",
    subject: "Programación",
    type: "class",
    status: "upcoming",
    attendees: [
      {
        id: "3",
        name: "María González",
        email: "maria.gonzalez@email.com",
        avatar: "/student-maria.png",
        status: "accepted",
      },
      {
        id: "4",
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@email.com",
        avatar: "/placeholder-w3xp6.png",
        status: "pending",
      },
      {
        id: "5",
        name: "Diego López",
        email: "diego.lopez@email.com",
        avatar: "/student-diego.jpg",
        status: "declined",
      },
    ],
  },
  {
    id: "2",
    title: "React Components Workshop",
    description: "Creación de componentes reutilizables en React",
    startTime: new Date(2025, 0, 15, 14, 0), // January 15, 2025, 2:00 PM
    endTime: new Date(2025, 0, 15, 16, 0), // January 15, 2025, 4:00 PM
    location: "Laboratorio 2",
    meetingUrl: "https://meet.google.com/xyz-uvwx-yz",
    teacher: {
      id: "6",
      name: "María Gómez",
      email: "maria.gomez@semillero.com",
      avatar: "/student-ana.jpg",
    },
    cohort: "Desarrollo Web - 2025 Q1",
    subject: "Frontend",
    type: "workshop",
    status: "completed",
    attendees: [
      {
        id: "3",
        name: "María González",
        email: "maria.gonzalez@email.com",
        avatar: "/student-maria.png",
        status: "attended",
      },
      {
        id: "4",
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@email.com",
        avatar: "/placeholder-w3xp6.png",
        status: "attended",
      },
      {
        id: "5",
        name: "Diego López",
        email: "diego.lopez@email.com",
        avatar: "/student-diego.jpg",
        status: "absent",
      },
    ],
  },
]

export function CalendarIntegration() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [currentView, setCurrentView] = useState<"today" | "week" | "month">("today")

  const getTodayEvents = () => {
    const today = new Date()
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      )
    })
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((event) => event.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default"
      case "ongoing":
        return "destructive"
      case "completed":
        return "secondary"
      case "cancelled":
        return "outline"
      default:
        return "default"
    }
  }

  const getAttendanceStats = (event: CalendarEvent) => {
    const total = event.attendees.length
    const attended = event.attendees.filter((a) => a.status === "attended").length
    const absent = event.attendees.filter((a) => a.status === "absent").length
    const pending = event.attendees.filter((a) => a.status === "pending").length

    return { total, attended, absent, pending }
  }

  const handleJoinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, "_blank")
  }

  const handleMarkAttendance = (eventId: string, attendeeId: string, status: "attended" | "absent") => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              attendees: event.attendees.map((attendee) =>
                attendee.id === attendeeId ? { ...attendee, status } : attendee,
              ),
            }
          : event,
      ),
    )
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendario de Clases</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("today")}
          >
            Hoy
          </Button>
          <Button
            variant={currentView === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("week")}
          >
            Semana
          </Button>
          <Button
            variant={currentView === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("month")}
          >
            Mes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Clases de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {getTodayEvents().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No hay clases programadas para hoy</div>
                ) : (
                  getTodayEvents().map((event) => (
                    <div key={event.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.subject}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.attendees.length} estudiantes
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(event.status) as any}>{event.status}</Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {event.meetingUrl && (
                          <Button size="sm" onClick={() => handleJoinMeeting(event.meetingUrl!)}>
                            <Video className="h-4 w-4 mr-1" />
                            Unirse
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{event.title}</DialogTitle>
                            </DialogHeader>
                            <EventDetails event={event} onMarkAttendance={handleMarkAttendance} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.cohort}</p>
                      </div>
                      <Badge variant={getStatusColor(event.status) as any}>{event.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{formatDate(event.startTime)}</p>
                      <p>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EventDetails({
  event,
  onMarkAttendance,
}: {
  event: CalendarEvent
  onMarkAttendance: (eventId: string, attendeeId: string, status: "attended" | "absent") => void
}) {
  const stats = getAttendanceStats(event)

  return (
    <div className="space-y-6">
      {/* Event Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Información de la Clase</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profesor:</span>
              <span>{event.teacher.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cohorte:</span>
              <span>{event.cohort}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materia:</span>
              <span>{event.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span>{formatDate(event.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horario:</span>
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            {event.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ubicación:</span>
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {event.description && (
          <div>
            <h3 className="font-medium mb-2">Descripción</h3>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        )}

        {event.meetingUrl && (
          <div className="flex items-center gap-2">
            <Button onClick={() => window.open(event.meetingUrl, "_blank")}>
              <Video className="h-4 w-4 mr-2" />
              Unirse a la Reunión
            </Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(event.meetingUrl!)}>
              Copiar Enlace
            </Button>
          </div>
        )}
      </div>

      {/* Attendance */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Asistencia</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">Presentes: {stats.attended}</span>
            <span className="text-red-400">Ausentes: {stats.absent}</span>
            <span className="text-amber-400">Pendientes: {stats.pending}</span>
          </div>
        </div>

        <div className="space-y-2">
          {event.attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {attendee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{attendee.name}</p>
                  <p className="text-xs text-muted-foreground">{attendee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    attendee.status === "attended"
                      ? "default"
                      : attendee.status === "absent"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {attendee.status === "attended"
                    ? "Presente"
                    : attendee.status === "absent"
                      ? "Ausente"
                      : attendee.status === "accepted"
                        ? "Confirmado"
                        : attendee.status === "declined"
                          ? "Rechazado"
                          : "Pendiente"}
                </Badge>

                {event.status === "completed" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={attendee.status === "attended" ? "default" : "outline"}
                      onClick={() => onMarkAttendance(event.id, attendee.id, "attended")}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={attendee.status === "absent" ? "destructive" : "outline"}
                      onClick={() => onMarkAttendance(event.id, attendee.id, "absent")}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDate(date: Date) {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getAttendanceStats(event: CalendarEvent) {
  const total = event.attendees.length
  const attended = event.attendees.filter((a) => a.status === "attended").length
  const absent = event.attendees.filter((a) => a.status === "absent").length
  const pending = event.attendees.filter((a) => a.status === "pending").length

  return { total, attended, absent, pending }
}
