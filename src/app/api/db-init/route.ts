import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db-init";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API route to initialize the database
 * This should only be accessible to admin users in a production environment
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check if the user is an admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to perform this action" },
        { status: 403 }
      );
    }

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
