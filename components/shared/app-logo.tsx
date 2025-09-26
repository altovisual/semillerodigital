"use client"

import { useTheme } from "@/contexts/theme-context"
import Image from "next/image"
import { useEffect, useState } from "react"

interface AppLogoProps {
  className?: string
  width?: number
  height?: number
}

export function AppLogo({ className = "", width = 120, height = 40 }: AppLogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Mostrar logo claro por defecto durante la carga
    return (
      <Image
        src="/SVG/Asset 2mvpx.svg"
        alt="Semillero Digital"
        width={width}
        height={height}
        className={className}
        priority
      />
    )
  }

  // Determinar qué logo usar basado en el tema
  const logoSrc = theme === "dark"
    ? "/SVG/Asset 1mvpx.svg"  // Logo para modo oscuro
    : "/SVG/Asset 2mvpx.svg"  // Logo para modo claro

  // Debug: agregar console.log para verificar el tema
  console.log("Theme debug:", { theme, logoSrc })

  return (
    <Image
      src={logoSrc}
      alt="Semillero Digital"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
