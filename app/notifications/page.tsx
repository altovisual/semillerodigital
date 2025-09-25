"use client"

import { NotificationCenter } from "@/components/notifications/notification-center"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Centro de Notificaciones</h1>
        <div className="border rounded-lg p-4">
          <NotificationCenter />
        </div>
      </div>
    </div>
  )
}
