import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { classroom } = await getClassroomClient()
    const { courseId } = params

    const res = await classroom.courses.courseWork.list({ courseId })
    const coursework = (res.data.courseWork || []).map((cw) => ({
      id: cw.id,
      title: cw.title,
      description: cw.description,
      state: cw.state,
      dueDate: cw.dueDate,
      dueTime: cw.dueTime,
      maxPoints: cw.maxPoints,
      workType: cw.workType,
      alternateLink: cw.alternateLink,
      creatorUserId: cw.creatorUserId,
      topicId: cw.topicId,
      creationTime: cw.creationTime,
      updateTime: cw.updateTime,
    }))

    return NextResponse.json(
      { courseId, coursework },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list coursework" }, { status: 500 })
  }
}
