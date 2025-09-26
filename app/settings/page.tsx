"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BackButton } from "@/components/shared/back-button"

export default function SettingsPage() {
  const { user, switchRole } = useAuth()
  const { theme, setTheme, toggleTheme } = useTheme()

  // Idioma (persistido en localStorage)
  const [lang, setLang] = useState<string>("es")
  useEffect(() => {
    const saved = localStorage.getItem("semillero_lang")
    if (saved) setLang(saved)
  }, [])
  useEffect(() => {
    localStorage.setItem("semillero_lang", lang)
  }, [lang])

  // Notificaciones (persistidas en localStorage)
  type NotifPrefs = { email: boolean; whatsapp: boolean; telegram: boolean }
  const [notif, setNotif] = useState<NotifPrefs>({ email: true, whatsapp: false, telegram: false })
  useEffect(() => {
    const saved = localStorage.getItem("semillero_notif_prefs")
    if (saved) setNotif(JSON.parse(saved))
  }, [])
  useEffect(() => {
    localStorage.setItem("semillero_notif_prefs", JSON.stringify(notif))
  }, [notif])

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias de Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rol actual</p>
              <Select value={user?.role} onValueChange={(r) => switchRole(r as any)}>
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">Coordinador</SelectItem>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">Selecciona claro u oscuro</p>
              </div>
              <Select value={theme} onValueChange={(t) => setTheme(t as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alternar rápidamente</p>
                <p className="text-sm text-muted-foreground">Usa el botón para cambiar el tema</p>
              </div>
              <Button variant="outline" onClick={toggleTheme}>Cambiar tema</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Idioma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Idioma de la interfaz</p>
                <p className="text-sm text-muted-foreground">Se guarda en tu dispositivo</p>
              </div>
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="notif-email">Email</Label>
              </div>
              <Switch
                id="notif-email"
                checked={notif.email}
                onCheckedChange={(v) => setNotif((p) => ({ ...p, email: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="notif-whatsapp">WhatsApp</Label>
              </div>
              <Switch
                id="notif-whatsapp"
                checked={notif.whatsapp}
                onCheckedChange={(v) => setNotif((p) => ({ ...p, whatsapp: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="notif-telegram">Telegram</Label>
              </div>
              <Switch
                id="notif-telegram"
                checked={notif.telegram}
                onCheckedChange={(v) => setNotif((p) => ({ ...p, telegram: v }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
