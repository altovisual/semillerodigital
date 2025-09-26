"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 120, height = 40, className = "" }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
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

  const isDark = resolvedTheme === 'dark'
  const logoSrc = isDark ? "/SVG/Asset 1mvpx.svg" : "/SVG/Asset 2mvpx.svg"

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
