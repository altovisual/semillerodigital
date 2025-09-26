"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSession } from "next-auth/react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "task" | "reminder" | "grade" | "attendance" | "system" | "deadline"
  priority: "low" | "medium" | "high"
  timestamp: Date
  read: boolean
  userId: string
  courseId?: string
  courseworkId?: string
  actionUrl?: string
}

interface NotificationSettings {
  email: boolean
  whatsapp: boolean
  telegram: boolean
  taskUpdates: boolean
  reminders: boolean
  grades: boolean
  attendance: boolean
  deadlines: boolean
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  settings: NotificationSettings
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read" | "userId">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  generateNotificationsFromClassroomData: (data: any) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { status: sessionStatus } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    whatsapp: false,
    telegram: false,
    taskUpdates: true,
    reminders: true,
    grades: true,
    attendance: true,
    deadlines: true,
  })

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`notifications_${user.email}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })))
        } catch (error) {
          console.error("Error loading notifications:", error)
        }
      }

      const savedSettings = localStorage.getItem(`notification_settings_${user.email}`)
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (error) {
          console.error("Error loading notification settings:", error)
        }
      }
    }
  }, [user?.email])

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user?.email && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.email}`, JSON.stringify(notifications))
    }
  }, [notifications, user?.email])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`notification_settings_${user.email}`, JSON.stringify(settings))
    }
  }, [settings, user?.email])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read" | "userId">) => {
    if (!user?.email) return

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      userId: user.email,
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep only last 50 notifications
  }, [user?.email])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // Generate notifications from Google Classroom data
  const generateNotificationsFromClassroomData = useCallback((data: {
    coursework?: Array<{ id?: string | null; title?: string | null; dueDate?: any; maxPoints?: number | null; courseId?: string | null }>
    submissions?: Array<{ id?: string | null; userId?: string | null; state?: string | null; late?: boolean | null; assignedGrade?: number | null }>
    courses?: Array<{ id?: string | null; name?: string | null }>
  }) => {
    if (!user?.email || !settings.taskUpdates) return

    // Generate notifications for new coursework
    if (data.coursework) {
      data.coursework.forEach(work => {
        if (work.title && work.dueDate) {
          const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day)
          const now = new Date()
          const timeDiff = dueDate.getTime() - now.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

          // Add deadline reminder if due within 3 days
          if (daysDiff <= 3 && daysDiff > 0 && settings.deadlines) {
            // Find the course for this coursework
            const course = data.courses?.find(c => c.id === work.courseId)
            const classroomUrl = course?.id && work.id 
              ? `https://classroom.google.com/c/${course.id}/a/${work.id}/details`
              : undefined

            addNotification({
              title: "Tarea próxima a vencer",
              message: `La tarea "${work.title}" vence en ${daysDiff} día${daysDiff > 1 ? 's' : ''}`,
              type: "deadline",
              priority: daysDiff === 1 ? "high" : "medium",
              courseworkId: work.id || undefined,
              actionUrl: classroomUrl,
            })
          }

          // Add overdue notification
          if (daysDiff < 0 && settings.reminders) {
            const course = data.courses?.find(c => c.id === work.courseId)
            const classroomUrl = course?.id && work.id 
              ? `https://classroom.google.com/c/${course.id}/a/${work.id}/details`
              : undefined

            addNotification({
              title: "Tarea vencida",
              message: `La tarea "${work.title}" venció hace ${Math.abs(daysDiff)} día${Math.abs(daysDiff) > 1 ? 's' : ''}`,
              type: "reminder",
              priority: "high",
              courseworkId: work.id || undefined,
              actionUrl: classroomUrl,
            })
          }
        }
      })
    }

    // Generate notifications for graded submissions
    if (data.submissions && settings.grades) {
      data.submissions.forEach(submission => {
        if (submission.assignedGrade && submission.assignedGrade > 0) {
          addNotification({
            title: "Nueva calificación disponible",
            message: `Has recibido una calificación: ${submission.assignedGrade} puntos`,
            type: "grade",
            priority: "low",
          })
        }
      })
    }
  }, [user?.email, settings, addNotification])

  // Auto-generate notifications based on time
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user?.email) return

    const interval = setInterval(() => {
      const now = new Date()
      const hour = now.getHours()

      // Morning reminder (9 AM)
      if (hour === 9 && settings.reminders) {
        addNotification({
          title: "¡Buenos días!",
          message: "Revisa tus tareas pendientes para hoy",
          type: "reminder",
          priority: "low",
        })
      }

      // Evening reminder (6 PM)
      if (hour === 18 && settings.reminders) {
        addNotification({
          title: "Recordatorio de tareas",
          message: "No olvides revisar tus entregas pendientes",
          type: "reminder",
          priority: "medium",
        })
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [sessionStatus, user?.email, settings.reminders, addNotification])

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    generateNotificationsFromClassroomData,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
