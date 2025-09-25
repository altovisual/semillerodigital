"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export type UserRole = "student" | "teacher" | "coordinator"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  cohort?: string
  subjects?: string[]
}

interface AuthContextType {
  user: User | null
  login: (email?: string, password?: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") return "student"
    return (localStorage.getItem("semillero_role") as UserRole) || "student"
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "authenticated" && session?.user?.email) {
      const nextUser: User = {
        id: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
        email: session.user.email,
        role,
        avatar: session.user.image || undefined,
      }
      setUser(nextUser)
    } else {
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.email, session?.user?.name, session?.user?.image])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("semillero_role", role)
      // reflect role change in user too
      setUser((prev) => (prev ? { ...prev, role } as User : prev))
    }
  }, [role])

  const login = async (): Promise<boolean> => {
    await signIn("google")
    return true
  }

  const logout = () => {
    signOut({ callbackUrl: "/" })
  }

  const switchRole = (newRole: UserRole) => {
    setRole(newRole)
  }

  const isLoading = status === "loading"

  return <AuthContext.Provider value={{ user, login, logout, switchRole, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
