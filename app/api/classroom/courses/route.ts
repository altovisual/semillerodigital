import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET() {
  try {
    // Mock mode: return fake courses without calling Google
    if (process.env.MOCK_MODE === "true") {
      const teacherIds = Array.from({ length: 20 }).map((_, i) => `t${i + 1}`)
      const names = [
        "Curso Demo Semillero Vibeathon",
        "Diseño UX/UI - 2025 Q1",
        "Desarrollo Web - 2025 Q1",
        "Data Science - 2025 Q1",
        "Marketing Digital - 2025 Q1",
        "QA Automation - 2025 Q1",
      ]
      const courses = names.map((n, i) => ({
        id: `course-${i + 1}`,
        name: n,
        section: String.fromCharCode(65 + (i % 4)),
        enrollmentCode: `CODE${100 + i}`,
        courseState: "ACTIVE",
        ownerId: teacherIds[i % teacherIds.length],
      }))
      return NextResponse.json(
        { email: "mock@student@example.com", courses },
        { headers: { "Cache-Control": "public, max-age=5" } },
      )
    }

    const { classroom, session } = await getClassroomClient()

    // Helper to list all pages
    const listAll = async (params: { teacherId?: string; studentId?: string }) => {
      const all: any[] = []
      let pageToken: string | undefined = undefined
      do {
        const res: any = await classroom.courses.list({ ...params, pageToken })
        if (res.data.courses) all.push(...res.data.courses)
        pageToken = res.data.nextPageToken || undefined
      } while (pageToken)
      return all
    }

    // Try as teacher and as student, then merge unique by id
    const [asTeacher, asStudent] = await Promise.all([
      listAll({ teacherId: "me" }).catch(() => []),
      listAll({ studentId: "me" }).catch(() => []),
    ])

    const byId = new Map<string, any>()
    for (const c of [...asTeacher, ...asStudent]) {
      if (c?.id && !byId.has(c.id)) byId.set(c.id, c)
    }
    const merged = Array.from(byId.values())

    const courses = merged
      .filter((c) => !c.courseState || c.courseState === "ACTIVE" || c.courseState === "PROVISIONED")
      .map((c) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        enrollmentCode: c.enrollmentCode,
        courseState: c.courseState,
        ownerId: c.ownerId,
      }))

    return NextResponse.json(
      { email: session.user?.email, courses },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    const message = e?.message || "Failed to fetch courses"
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } })
  }
}
