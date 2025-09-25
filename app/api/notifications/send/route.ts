import { type NextRequest, NextResponse } from "next/server"
import { notificationService } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payload, channels } = body

    if (!payload || !payload.to || !payload.subject || !payload.message) {
      return NextResponse.json({ error: "Missing required fields: to, subject, message" }, { status: 400 })
    }

    const results = await notificationService.sendNotification(payload, channels)

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Notification API error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
