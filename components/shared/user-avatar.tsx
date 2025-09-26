"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

export function UserAvatar({
  name,
  email,
  photoUrl,
  size = 32,
  className = "",
}: {
  name?: string | null
  email?: string | null
  photoUrl?: string | null
  size?: number
  className?: string
}) {
  const { data: session } = useSession()

  // Fallbacks en orden: foto del alumno en Classroom -> imagen del usuario autenticado (si coincide email) -> placeholder genérico
  const matchedSessionImage = session?.user?.email && email && session.user.email === email ? session.user.image : undefined
  const src = photoUrl || matchedSessionImage || "/placeholder-user.jpg"

  const style = { width: size, height: size }

  return (
    <Avatar className={className} style={style as any}>
      <AvatarImage src={src} alt={name || email || "Usuario"} />
      {/* No mostrar iniciales: dejar fallback vacío para no ver letras */}
      <AvatarFallback />
    </Avatar>
  )
}
