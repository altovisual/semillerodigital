"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ClassroomIntegrationPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [log, setLog] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const isAuthenticated = sessionStatus === "authenticated"

  const connect = async () => {
    await signIn("google")
  }

  const disconnect = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const sync = async () => {
    setLoading(true)
    try {
      const resp = await fetch("/api/classroom/courses")
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      const count = (data.courses?.length ?? 0)
      setLog((l) => [
        `Email: ${data.email || session?.user?.email || "desconocido"} | Cursos: ${count}`,
        ...l,
      ])
    } catch (e: any) {
      setLog((l) => [e?.message || "Error al sincronizar", ...l])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Integración: Google Classroom</h1>
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isAuthenticated ? "Conectado" : "Desconectado"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conexión</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            {!isAuthenticated ? (
              <Button onClick={connect} disabled={loading}>
                {loading ? "Conectando..." : "Conectar con Google"}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={disconnect}>Desconectar</Button>
                <Button onClick={sync} disabled={loading}>
                  {loading ? "Sincronizando..." : "Listar cursos"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              {log.length === 0 ? (
                <p>No hay eventos aún.</p>
              ) : (
                log.map((line, idx) => (
                  <div key={idx} className="border-b last:border-0 pb-2">
                    {line}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos pasos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Completar credenciales OAuth en `.env.local` (ya lo hiciste).</p>
            <p>2. Probar inicio de sesión y listar cursos para validar permisos.</p>
            <p>3. Implementar endpoints adicionales para alumnos, tareas y entregas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
