"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface BackButtonProps {
  href?: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function BackButton({ 
  href, 
  label = "Atrás", 
  variant = "ghost",
  className = ""
}: BackButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      // Navegar al dashboard correcto según el rol del usuario
      const dashboardRoute = user?.role ? `/dashboard/${user.role}` : "/dashboard/student"
      router.push(dashboardRoute)
    }
  }

  return (
    <Button 
      variant={variant} 
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
