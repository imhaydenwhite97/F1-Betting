import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db-init";

/**
 * Public API route to initialize the database
 * This should be disabled in production environments
 */
export async function GET(request: NextRequest) {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Initialize the database
    const result = await initDb();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
