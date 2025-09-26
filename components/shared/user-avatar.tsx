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

  // Usar cualquier imagen disponible
  const matchedSessionImage = session?.user?.email && email && session.user.email === email ? session.user.image : undefined
  let src = matchedSessionImage || photoUrl || session?.user?.image || "/placeholder-user.jpg"
  
  // Modificar URL de Google para evitar problemas de CORS
  if (src && src.includes('googleusercontent.com')) {
    // Cambiar el tamaño y forzar descarga directa
    src = src.replace(/=s\d+-c$/, '=s96-c-k-no')
  }

  const style = { width: size, height: size }

  // Generar iniciales para el fallback
  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <Avatar className={className} style={style as any}>
      <AvatarImage 
        src={src} 
        alt={name || email || "Usuario"}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Intentar forzar la recarga sin cache si falla
          const img = e.target as HTMLImageElement
          if (img && !img.src.includes('?nocache=')) {
            img.src = src + '?nocache=' + Date.now()
          }
        }}
      />
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  )
}
