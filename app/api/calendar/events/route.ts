import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(req: Request) {
  try {
    if (process.env.MOCK_MODE === "true") {
      const now = new Date()
      const mk = (days: number, h: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).setHours(h, 0, 0, 0)
      const toISO = (ms: number) => new Date(ms).toISOString()
      const events = [
        { id: "ev-1", summary: "Clase: Introducción", start: toISO(mk(1, 9)), end: toISO(mk(1, 11)), location: "Aula 101", hangoutLink: "https://meet.google.com/abc-defg-hij" },
        { id: "ev-2", summary: "Workshop: Prototipos", start: toISO(mk(3, 14)), end: toISO(mk(3, 16)), location: "Remoto", hangoutLink: "https://meet.google.com/xyz-abcd-uvw" },
        { id: "ev-3", summary: "Revisión de proyecto", start: toISO(mk(5, 10)), end: toISO(mk(5, 12)), location: "Aula 202" },
      ]
      return NextResponse.json({ events })
    }

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
