"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signOut } from "next-auth/react"
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
import { LogOut, User as UserIcon, Bell, HelpCircle, BarChart3, Plug, Settings, Palette, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/contexts/auth-context"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ProfileMenu({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [changeOpen, setChangeOpen] = useState(false)
  const router = useRouter()
  const { switchRole } = useAuth()
  const { data: session } = useSession()

  const photo = user?.avatar || session?.user?.image || "/placeholder-user.jpg"

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
              <AvatarImage src={photo} alt={user?.name || user?.email || "Usuario"} />
              <AvatarFallback />
            </Avatar>
            <span className="hidden sm:inline-block">{user?.name}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[380px] max-w-[100vw] p-0">
          <div className="p-5 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={photo} alt={user?.name || user?.email || "Usuario"} />
                <AvatarFallback />
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate">{user?.name || "Invitado"}</SheetTitle>
                <SheetDescription className="truncate text-sm">{user?.email || ""}</SheetDescription>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">Cuenta</div>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/profile") }}>
              <UserIcon className="mr-2 h-4 w-4" /> Mi Perfil
            </Button>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/settings") }}>
              <Settings className="mr-2 h-4 w-4" /> Ajustes
            </Button>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/notifications") }}>
              <Bell className="mr-2 h-4 w-4" /> Notificaciones
            </Button>

            <div className="px-3 py-2 mt-2 text-xs uppercase tracking-wide text-muted-foreground">Herramientas</div>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/integrations/classroom") }}>
              <Plug className="mr-2 h-4 w-4" /> Integraciones
            </Button>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/integrations/classroom") }}>
              <BarChart3 className="mr-2 h-4 w-4" /> Mis Cursos
            </Button>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { setOpen(false); router.push("/reports") }}>
              <BarChart3 className="mr-2 h-4 w-4" /> Reportes
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-10"
              onClick={() => {
                setOpen(false)
                if (typeof window !== "undefined") window.open("https://calendar.google.com", "_blank")
              }}
            >
              <Calendar className="mr-2 h-4 w-4" /> Mi Calendario
            </Button>

            <div className="px-3 py-2 mt-2 text-xs uppercase tracking-wide text-muted-foreground">Apariencia</div>
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2 text-sm">
                <Palette className="h-4 w-4 text-muted-foreground" /> Tema
              </div>
              <ThemeToggle />
            </div>

            <div className="my-2 h-px bg-border" />
            <div className="p-3">
              <Button variant="destructive" className="w-full" onClick={async () => {
                await signOut({ callbackUrl: "/" })
              }}>
                <LogOut className="mr-2 h-4 w-4" /> Desconectar
              </Button>
            </div>
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
              onClick={async () => {
                // Comportamiento idéntico a Integraciones: desconectar con NextAuth
                await signOut({ callbackUrl: "/" })
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
