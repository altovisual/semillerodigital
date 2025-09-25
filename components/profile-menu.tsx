"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, User as UserIcon, Bell, HelpCircle, BarChart3, Plug } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/contexts/auth-context"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ProfileMenu({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [changeOpen, setChangeOpen] = useState(false)
  const router = useRouter()
  const { switchRole } = useAuth()

  // Si no hay usuario, mostramos un botón simple para ir a iniciar sesión
  if (!user) {
    return (
      <Button variant="ghost" onClick={() => router.replace("/")}>Iniciar sesión</Button>
    )
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3" onClick={() => setOpen(true)}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block">{user?.name}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[360px] max-w-[100vw]">
          <SheetHeader className="mb-4 text-left">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">{user?.name || "Invitado"}</SheetTitle>
                <SheetDescription className="truncate">{user?.email || ""}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/profile") }}>
              <UserIcon className="mr-2 h-4 w-4" /> Mi Perfil
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/settings") }}>
              ⚙️ Ajustes
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/reports") }}>
              <BarChart3 className="mr-2 h-4 w-4" /> Reportes
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/integrations/classroom") }}>
              <Plug className="mr-2 h-4 w-4" /> Integraciones
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/notifications") }}>
              <Bell className="mr-2 h-4 w-4" /> Notificaciones
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => { setOpen(false); router.push("/help") }}>
              <HelpCircle className="mr-2 h-4 w-4" /> Ayuda
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setChangeOpen(true)}>
              🔒 Cambiar contraseña
            </Button>

            <div className="my-2 h-px bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rol</p>
                <p className="text-xs text-muted-foreground">Cambia la vista rápidamente</p>
              </div>
              <Select
                value={user?.role}
                onValueChange={(role) => {
                  switchRole(role as any)
                  setOpen(false)
                  router.replace(`/dashboard/${role}`)
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">Coordinador</SelectItem>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  <SelectItem value="student">Estudiante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" className="justify-start text-destructive" onClick={() => setLogoutOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Se cerrará tu sesión actual y regresarás a la pantalla de inicio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                try {
                  onLogout()
                } finally {
                  if (typeof window !== "undefined") {
                    window.location.href = "/"
                  }
                }
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Cambiar contraseña */}
      <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>Ingresa tu contraseña actual y la nueva contraseña.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const curr = (form.elements.namedItem("current") as HTMLInputElement).value
              const next = (form.elements.namedItem("next") as HTMLInputElement).value
              const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value
              if (!curr || !next || !confirm) {
                alert("Por favor completa todos los campos.")
                return
              }
              if (next !== confirm) {
                alert("Las contraseñas no coinciden.")
                return
              }
              // Aquí iría la llamada a API real.
              alert("Contraseña actualizada correctamente (demostración)")
              setChangeOpen(false)
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="current">Contraseña actual</Label>
              <Input id="current" name="current" type="password" autoComplete="current-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="next">Nueva contraseña</Label>
              <Input id="next" name="next" type="password" autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChangeOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
          <div className="pt-2 text-xs text-muted-foreground">
            ¿Necesitas ayuda? <a className="underline" href="mailto:soporte@semillero.com">Contactar soporte</a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
