import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

// /api/classroom/courses/:courseId/submissions?courseworkId=...
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    const { searchParams } = new URL(req.url)
    const courseworkId = searchParams.get("courseworkId") || undefined
    const userId = searchParams.get("userId") || undefined
    if (!courseworkId) {
      return NextResponse.json({ error: "Missing courseworkId" }, { status: 400 })
    }

    if (process.env.MOCK_MODE === "true") {
      const { searchParams } = new URL(req.url)
      const courseworkId = searchParams.get("courseworkId") || undefined
      const userId = searchParams.get("userId") || undefined
      if (!courseworkId) {
        return NextResponse.json({ error: "Missing courseworkId" }, { status: 400 })
      }
      const students = Array.from({ length: 144 }).map((_, i) => `s${i + 1}`)
      const pool = userId ? students.filter((s) => s === userId) : students
      const states = ["TURNED_IN", "RETURNED", "NO_SUBMISSION", "PENDING"]
      const submissions = pool.map((uid, i) => ({
        id: `${courseworkId}-${uid}`,
        state: states[i % states.length],
        assignedGrade: i % 3 === 0 ? Math.max(50, 95 - (i % 40)) : null,
        alternateLink: "https://classroom.google.com",
        late: i % 4 === 2,
        updateTime: new Date().toISOString(),
        userId: uid,
      }))
      return NextResponse.json({ courseId, courseworkId, submissions })
    }

    const { classroom } = await getClassroomClient()

    const res = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: courseworkId,
      userId,
    })

    const submissions = (res.data.studentSubmissions || []).map((s) => ({
      id: s.id,
      state: s.state,
      assignedGrade: s.assignedGrade,
      alternateLink: s.alternateLink,
      late: s.late,
      updateTime: s.updateTime,
      userId: s.userId,
    }))

    return NextResponse.json(
      { courseId, courseworkId, submissions },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list submissions" }, { status: 500 })
  }
}
