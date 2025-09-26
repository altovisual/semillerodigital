"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/shared/back-button"
import { Plug, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-3">
              <Plug className="h-6 w-6" />
              <h1 className="text-xl sm:text-2xl font-bold">Integración: Google Classroom</h1>
            </div>
          </div>
          <Badge variant={isAuthenticated ? "default" : "secondary"} className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {/* Estado de la conexión */}
        <Card className={isAuthenticated ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50" : "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50"}>
          <CardContent className="flex items-center gap-4 p-6">
            {isAuthenticated ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {isAuthenticated ? "Integración Activa" : "Integración Requerida"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated 
                  ? "Tu cuenta está conectada con Google Classroom. Puedes sincronizar cursos y datos."
                  : "Conecta tu cuenta de Google para acceder a los datos de Google Classroom."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conexión</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            {!isAuthenticated ? (
              <Button onClick={connect} disabled={loading} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {loading ? "Conectando..." : "Conectar con Google"}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={disconnect} className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Desconectar
                </Button>
                <Button onClick={sync} disabled={loading} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Sincronizando..." : "Sincronizar cursos"}
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
