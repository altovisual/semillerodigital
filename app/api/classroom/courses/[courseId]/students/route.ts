import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { classroom } = await getClassroomClient()
    const { courseId } = params

    const roster = await classroom.courses.students.list({ courseId })
    const students = (roster.data.students || []).map((s) => ({
      userId: s.userId,
      profile: {
        id: s.profile?.id,
        name: s.profile?.name?.fullName,
        email: s.profile?.emailAddress,
        photoUrl: s.profile?.photoUrl,
      },
    }))

    return NextResponse.json(
      { courseId, students },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to list students" }, { status: 500 })
  }
}
