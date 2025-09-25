import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function getClassroomClient() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    throw new Error("No authenticated Google session with access token")
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  oauth2Client.setCredentials({ access_token: session.accessToken })

  const classroom = google.classroom({ version: "v1", auth: oauth2Client })
  return { classroom, session }
}
