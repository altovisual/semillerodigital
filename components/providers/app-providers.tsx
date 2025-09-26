"use client"

import { Suspense, type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { NotificationsProvider } from "@/contexts/notifications-context"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AuthProvider>
          <NotificationsProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </NotificationsProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
