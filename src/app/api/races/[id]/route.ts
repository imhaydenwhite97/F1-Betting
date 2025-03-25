import { db } from "@/lib/db";
import { races, results } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Updated import

// GET /api/races/[id] - Get a race by ID with results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const raceId = (await params).id;

    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
      with: {
        results: {
          with: {
            driver: true,
          },
        },
        bets: true,
      },
    });

    if (!race) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(race);
  } catch (error) {
    console.error("Error fetching race:", error);
    return NextResponse.json(
      { error: "Failed to fetch race" },
      { status: 500 }
    );
  }
}

// PATCH /api/races/[id] - Update a race (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const raceId = (await params).id;
    const data = await request.json();

    // Check if race exists
    const existingRace = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    if (!existingRace) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    // Update the race
    await db.update(races)
      .set({
        name: data.name ?? existingRace.name,
        location: data.location ?? existingRace.location,
        date: data.date ? new Date(data.date) : existingRace.date,
        season: data.season ?? existingRace.season,
        round: data.round ?? existingRace.round,
        bettingDeadline: data.bettingDeadline
          ? new Date(data.bettingDeadline)
          : existingRace.bettingDeadline,
        isCompleted: data.isCompleted !== undefined
          ? data.isCompleted
          : existingRace.isCompleted,
        isActive: data.isActive !== undefined
          ? data.isActive
          : existingRace.isActive,
        fastestLapDriver: data.fastestLapDriver ?? existingRace.fastestLapDriver,
        updatedAt: new Date(),
      })
      .where(eq(races.id, raceId));

    const updatedRace = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("Error updating race:", error);
    return NextResponse.json(
      { error: "Failed to update race" },
      { status: 500 }
    );
  }
}

// DELETE /api/races/[id] - Delete a race (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const raceId = (await params).id;

    // Check if race exists
    const existingRace = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    if (!existingRace) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    // Delete race (cascade will handle results and bets)
    await db.delete(races).where(eq(races.id, raceId));

    return NextResponse.json(
      { message: "Race deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting race:", error);
    return NextResponse.json(
      { error: "Failed to delete race" },
      { status: 500 }
    );
  }
}
