import { db, generateId } from "@/lib/db";
import { races } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Updated import for authOptions

// GET /api/races - Get all races
export async function GET() {
  try {
    const allRaces = await db.query.races.findMany({
      orderBy: (races, { desc }) => [desc(races.date)],
    });

    return NextResponse.json(allRaces);
  } catch (error) {
    console.error("Error fetching races:", error);
    return NextResponse.json(
      { error: "Failed to fetch races" },
      { status: 500 }
    );
  }
}

// POST /api/races - Create a new race (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'location', 'date', 'season', 'round', 'bettingDeadline'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const raceId = generateId();

    await db.insert(races).values({
      id: raceId,
      name: data.name,
      location: data.location,
      date: new Date(data.date),
      season: data.season,
      round: data.round,
      bettingDeadline: new Date(data.bettingDeadline),
      isCompleted: data.isCompleted || false,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newRace = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    return NextResponse.json(newRace, { status: 201 });
  } catch (error) {
    console.error("Error creating race:", error);
    return NextResponse.json(
      { error: "Failed to create race" },
      { status: 500 }
    );
  }
}
