// Google Calendar integration service
export interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  discoveryDoc: string
  scopes: string
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: "needsAction" | "declined" | "tentative" | "accepted"
  }>
  conferenceData?: {
    conferenceSolution: {
      key: {
        type: string
      }
    }
    createRequest: {
      requestId: string
    }
  }
}

class GoogleCalendarService {
  private gapi: any = null
  private isInitialized = false

  private config: GoogleCalendarConfig = {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    discoveryDoc: "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    scopes: "https://www.googleapis.com/auth/calendar",
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      // Load Google API script
      await this.loadGoogleAPI()

      // Initialize the API
      await this.gapi.load("client:auth2", async () => {
        await this.gapi.client.init({
          apiKey: this.config.apiKey,
          clientId: this.config.clientId,
          discoveryDocs: [this.config.discoveryDoc],
          scope: this.config.scopes,
        })

        this.isInitialized = true
        console.log("[v0] Google Calendar API initialized")
      })
    } catch (error) {
      console.error("[v0] Failed to initialize Google Calendar API:", error)
      throw error
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).gapi) {
        this.gapi = (window as any).gapi
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => {
        this.gapi = (window as any).gapi
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      return user.isSignedIn()
    } catch (error) {
      console.error("[v0] Google Calendar sign-in failed:", error)
      return false
    }
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
    } catch (error) {
      console.error("[v0] Google Calendar sign-out failed:", error)
    }
  }

  async getEvents(calendarId = "primary", timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const request = {
        calendarId,
        timeMin: timeMin?.toISOString() || new Date().toISOString(),
        timeMax: timeMax?.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      }

      const response = await this.gapi.client.calendar.events.list(request)
      return response.result.items || []
    } catch (error) {
      console.error("[v0] Failed to fetch calendar events:", error)
      return []
    }
  }

  async createEvent(event: Partial<GoogleCalendarEvent>, calendarId = "primary"): Promise<GoogleCalendarEvent> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const response = await this.gapi.client.calendar.events.insert({
        calendarId,
        resource: event,
      })

      console.log("[v0] Calendar event created:", response.result)
      return response.result
    } catch (error) {
      console.error("[v0] Failed to create calendar event:", error)
      throw error
    }
  }

  async updateEvent(
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId = "primary",
  ): Promise<GoogleCalendarEvent> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const response = await this.gapi.client.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
      })

      console.log("[v0] Calendar event updated:", response.result)
      return response.result
    } catch (error) {
      console.error("[v0] Failed to update calendar event:", error)
      throw error
    }
  }

  async deleteEvent(eventId: string, calendarId = "primary"): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId,
        eventId,
      })

      console.log("[v0] Calendar event deleted:", eventId)
    } catch (error) {
      console.error("[v0] Failed to delete calendar event:", error)
      throw error
    }
  }

  // Helper method to create a class event with Google Meet
  async createClassEvent(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendeeEmails: string[],
    location?: string,
  ): Promise<GoogleCalendarEvent> {
    const event: Partial<GoogleCalendarEvent> = {
      summary: title,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Bogota", // Adjust timezone as needed
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Bogota",
      },
      location,
      attendees: attendeeEmails.map((email) => ({
        email,
        responseStatus: "needsAction",
      })),
      conferenceData: {
        createRequest: {
          requestId: `meet_${Date.now()}`,
        },
        conferenceSolution: {
          key: {
            type: "hangoutsMeet",
          },
        },
      },
    }

    return this.createEvent(event)
  }

  // Sync attendance data back to calendar
  async updateAttendance(eventId: string, attendanceData: Record<string, "attended" | "absent">) {
    // This would typically update custom properties or description
    // Google Calendar doesn't have built-in attendance tracking
    console.log("[v0] Updating attendance for event:", eventId, attendanceData)

    try {
      const event = await this.gapi.client.calendar.events.get({
        calendarId: "primary",
        eventId,
      })

      const attendanceReport = Object.entries(attendanceData)
        .map(([email, status]) => `${email}: ${status}`)
        .join("\n")

      const updatedDescription = `${event.result.description || ""}\n\nAsistencia:\n${attendanceReport}`

      await this.updateEvent(eventId, {
        description: updatedDescription,
      })
    } catch (error) {
      console.error("[v0] Failed to update attendance:", error)
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()
