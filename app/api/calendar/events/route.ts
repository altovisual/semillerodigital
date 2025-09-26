import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: "No authenticated Google session" }, { status: 401 })
    }

    const url = new URL(req.url)
    const timeMin = url.searchParams.get("timeMin")
    const timeMax = url.searchParams.get("timeMax")
    const calendarId = url.searchParams.get("calendarId") || "primary"

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    )
    oauth2Client.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    const res = await calendar.events.list({
      calendarId,
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = (res.data.items || []).map((e) => ({
      id: e.id!,
      summary: e.summary || "(Sin título)",
      description: e.description,
      start: e.start?.dateTime || e.start?.date || null,
      end: e.end?.dateTime || e.end?.date || null,
      location: e.location,
      hangoutLink: e.hangoutLink,
      attendees: (e.attendees || []).map((a) => ({
        email: a.email!,
        displayName: a.displayName || undefined,
        responseStatus: a.responseStatus as any,
      })),
    }))

    return NextResponse.json({ events }, { headers: { "Cache-Control": "private, max-age=30" } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch calendar events" }, { status: 500 })
  }
}
