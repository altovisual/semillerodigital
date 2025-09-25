"use client"

import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        {user ? (
          <div className="border rounded-lg p-4 space-y-1">
            <p><span className="font-medium">Nombre:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Rol:</span> {user.role}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">No has iniciado sesión.</p>
        )}
      </div>
    </div>
  )
}
