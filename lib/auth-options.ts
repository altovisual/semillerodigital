import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Extend JWT to carry Google tokens
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}

// Extend Session to expose tokens if needed client-side (optional)
declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "profile",
            "email",
            // Classroom read-only scopes
            "https://www.googleapis.com/auth/classroom.courses.readonly",
            "https://www.googleapis.com/auth/classroom.rosters.readonly",
            "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
            "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Helper: refresh access token using Google's endpoint
      const refreshAccessToken = async (t: any) => {
        try {
          if (!t.refreshToken) return t
          const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: t.refreshToken as string,
          })
          const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          })
          const json = await res.json()
          if (!res.ok) throw new Error(json?.error || "Failed to refresh token")
          const expiresIn = (json.expires_in as number | undefined) ?? 3600
          return {
            ...t,
            accessToken: json.access_token as string,
            accessTokenExpires: Date.now() + expiresIn * 1000,
            // Google may not always return a new refresh_token
            refreshToken: json.refresh_token ? (json.refresh_token as string) : t.refreshToken,
          }
        } catch (e) {
          // Mark token invalid so session can handle reauth on next request
          return { ...t, accessToken: undefined, accessTokenExpires: 0 }
        }
      }

      // Initial sign in
      if (account) {
        token.accessToken = account.access_token as string | undefined
        token.refreshToken = account.refresh_token as string | undefined
        // expires_at is seconds since epoch
        const expiresAt = (account.expires_at as number | undefined) ?? 0
        token.accessTokenExpires = expiresAt * 1000 // to ms
        return token
      }

      // If token not expired, return it
      if (token.accessToken && token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60_000) {
        return token
      }

      // Try to refresh using refresh_token
      const refreshed = await refreshAccessToken(token)
      return refreshed
    },
    async session({ session, token }) {
      // Expose accessToken in session if needed
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },
}
