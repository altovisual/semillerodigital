"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppLogo } from "@/components/shared/app-logo"
import { GoogleIcon } from "@/components/ui/google-icon"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError("Credenciales inválidas. Intenta de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <AppLogo width={160} height={60} className="max-w-full h-auto" />
          </div>
          <CardDescription className="text-base">Ingresa con Google o tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botón Google */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-3 h-11"
              onClick={() => login()}
              disabled={isLoading}
            >
              {!isLoading && <GoogleIcon className="w-5 h-5" />}
              {isLoading ? "Conectando..." : "Continuar con Google"}
            </Button>
            <div className="relative text-center">
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border" aria-hidden />
              <span className="relative bg-card px-2 text-xs text-muted-foreground">o</span>
            </div>
          </div>

          {/* Formulario tradicional (opcional) */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Cuentas de prueba:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Coordinador:</strong> coordinator@semillero.com
              </p>
              <p>
                <strong>Profesor:</strong> teacher@semillero.com
              </p>
              <p>
                <strong>Estudiante:</strong> student@semillero.com
              </p>
              <p>
                <strong>Contraseña:</strong> 123456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
