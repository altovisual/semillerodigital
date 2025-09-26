import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

// Cache simple en memoria por proceso (puede reiniciarse entre despliegues)
// userId -> { url, t }
const photoCache: Map<string, { url?: string; t: number }> = new Map()
const TTL_MS = 10 * 60 * 1000 // 10 minutos

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    if (process.env.MOCK_MODE === "true") {
      // 144 alumnos ficticios
      const baseNames = [
        "Carlos Rodríguez","María González","Juan Pérez","Lucía Martínez","Diego López","Sofía Herrera","Ana Torres","Pedro Ramírez","Valentina Díaz","Mateo García",
        "Camila Romero","Javier Silva","Paula Castro","Martin Rivas","Agustina Vega","Emilio Navarro","Laura Campos","Nicolás Herrera","Julia Soto","Franco Díaz"
      ]
      const students = Array.from({ length: 144 }).map((_, i) => {
        const name = `${baseNames[i % baseNames.length]} ${Math.floor(i / baseNames.length) + 1}`
        return {
          userId: `s${i + 1}`,
          profile: {
            id: `s${i + 1}`,
            name,
            email: `student${i + 1}@example.com`,
            photoUrl: undefined,
          },
        }
      })
      return NextResponse.json({ courseId, students })
    }

    const { classroom } = await getClassroomClient()

    const roster = await classroom.courses.students.list({ courseId })
    const base = (roster.data.students || []).map((s) => ({
      userId: s.userId,
      profile: {
        id: s.profile?.id || undefined,
        name: s.profile?.name?.fullName || undefined,
        email: s.profile?.emailAddress || undefined,
        photoUrl: s.profile?.photoUrl || undefined,
      },
    }))

    // Si algún alumno viene sin photoUrl, intentamos recuperarla vía userProfiles.get
    const students = await Promise.all(
      base.map(async (st) => {
        if (!st.profile?.photoUrl && st.userId) {
          const key = String(st.userId)
          const now = Date.now()
          const cached = photoCache.get(key)
          if (!cached || now - cached.t > TTL_MS) {
            try {
              const p = await classroom.userProfiles.get({ userId: key })
              photoCache.set(key, { url: p.data.photoUrl || undefined, t: now })
            } catch {
              photoCache.set(key, { url: undefined, t: now })
            }
          }
          const url = photoCache.get(key)?.url
          return {
            ...st,
            profile: { ...st.profile, photoUrl: url || st.profile?.photoUrl },
          }
        }
        return st
      }),
    )

    return NextResponse.json(
      { courseId, students },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list students" }, { status: 500 })
  }
}
