import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/auth/check-username?username=value - Check if a username is available
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}
