import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { classroom } = await getClassroomClient()
    const { courseId } = params

    const res = await classroom.courses.teachers.list({ courseId })
    const teachers = (res.data.teachers || []).map((t) => ({
      userId: t.userId,
      profile: {
        id: t.profile?.id,
        name: t.profile?.name?.fullName || undefined,
        email: t.profile?.emailAddress || undefined,
        photoUrl: t.profile?.photoUrl || undefined,
      },
    }))

    return NextResponse.json(
      { courseId, teachers },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    const msg = e?.message || "Failed to list teachers"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
