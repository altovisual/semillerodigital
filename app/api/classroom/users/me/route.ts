import { NextResponse } from "next/server"
import { getClassroomClient } from "@/lib/google-client"

export async function GET() {
  try {
    if (process.env.MOCK_MODE === "true") {
      const profile = { id: "s1", name: "Sr. Manuel", email: "student1@example.com", photoUrl: undefined }
      return NextResponse.json({ email: profile.email, profile })
    }

    const { classroom, session } = await getClassroomClient()

    // Fetch the signed-in user's Classroom profile
    const me = await classroom.userProfiles.get({ userId: "me" as any })

    const profile = me.data
      ? {
          id: me.data.id,
          name: me.data.name?.fullName,
          email: me.data.emailAddress,
          photoUrl: me.data.photoUrl,
        }
      : null

    return NextResponse.json(
      { email: session.user?.email, profile },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120" } },
    )
  } catch (e: any) {
    const message = e?.message || "Failed to fetch user profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
