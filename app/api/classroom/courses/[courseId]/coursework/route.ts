import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    if (process.env.MOCK_MODE === "true") {
      const now = new Date()
      const mkDate = (offsetWeeks: number) => {
        const d = new Date(now.getTime() + offsetWeeks * 7 * 24 * 60 * 60 * 1000)
        return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
      }
      const coursework = [
        { id: `${courseId}-w1`, title: "Tarea 1 - ¡Manos a la Obra!", dueDate: mkDate(1), maxPoints: 100, alternateLink: "https://classroom.google.com" },
        { id: `${courseId}-w2`, title: "Tarea 2 - ¡Creando cuenta!", dueDate: mkDate(2), maxPoints: 100, alternateLink: "https://classroom.google.com" },
        { id: `${courseId}-w3`, title: "Tarea 3 - Prototipo", dueDate: mkDate(3), maxPoints: 50, alternateLink: "https://classroom.google.com" },
        { id: `${courseId}-w4`, title: "Tarea 4 - Presentación", dueDate: mkDate(4), maxPoints: 80, alternateLink: "https://classroom.google.com" },
      ]
      return NextResponse.json({ courseId, coursework })
    }

    const { classroom } = await getClassroomClient()

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
