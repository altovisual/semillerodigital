import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

// /api/classroom/courses/:courseId/submissions?courseworkId=...
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { classroom } = await getClassroomClient()
    const { courseId } = params

    const { searchParams } = new URL(req.url)
    const courseworkId = searchParams.get("courseworkId") || undefined
    const userId = searchParams.get("userId") || undefined
    if (!courseworkId) {
      return NextResponse.json({ error: "Missing courseworkId" }, { status: 400 })
    }

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
