import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Initializing database connection...")

    // Connect to database
    await databaseService.connect()

    // Test the connection with a simple query
    const result = await databaseService.query("SELECT 1 as test")

    if (result.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Database connection established successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error("Database connection test failed")
    }
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database connection",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get database status
    const users = await databaseService.query("SELECT COUNT(*) as count FROM users")
    const cohorts = await databaseService.query("SELECT COUNT(*) as count FROM cohorts")
    const tasks = await databaseService.query("SELECT COUNT(*) as count FROM tasks")

    return NextResponse.json({
      success: true,
      status: "connected",
      statistics: {
        users: users.rows[0]?.count || 0,
        cohorts: cohorts.rows[0]?.count || 0,
        tasks: tasks.rows[0]?.count || 0,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Database status check failed:", error)
    return NextResponse.json(
      {
        success: false,
        status: "disconnected",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
