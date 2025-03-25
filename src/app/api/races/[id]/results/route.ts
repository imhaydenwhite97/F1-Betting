import { db, generateId } from "@/lib/db";
import { races, results, bets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateScore, Prediction } from "@/lib/scoring";

// POST /api/races/[id]/results - Submit race results (admin only)
export async function POST(
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

    // Validate required fields
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json(
        { error: "Missing or invalid results data" },
        { status: 400 }
      );
    }

    // Check if race exists
    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    if (!race) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    // First clear any existing results
    await db.delete(results).where(eq(results.raceId, raceId));

    // Insert new results
    for (const result of data.results) {
      if (!result.driverId) continue;

      await db.insert(results).values({
        id: generateId(),
        raceId: raceId,
        driverId: result.driverId,
        position: result.position || null,
        dnf: result.dnf || false,
        fastestLap: result.fastestLap || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update race as completed and set fastest lap driver if provided
    await db.update(races)
      .set({
        isCompleted: true,
        fastestLapDriver: data.fastestLapDriver || null,
        updatedAt: new Date(),
      })
      .where(eq(races.id, raceId));

    // Calculate scores for all bets on this race
    await calculateBetScores(raceId);

    // Get updated race with results
    const updatedRace = await db.query.races.findFirst({
      where: eq(races.id, raceId),
      with: {
        results: {
          with: {
            driver: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("Error submitting race results:", error);
    return NextResponse.json(
      { error: "Failed to submit race results" },
      { status: 500 }
    );
  }
}

// GET /api/races/[id]/results - Get race results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const raceId = (await params).id;

    // Check if race exists
    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
      with: {
        results: {
          with: {
            driver: true,
          },
        },
      },
    });

    if (!race) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(race.results);
  } catch (error) {
    console.error("Error fetching race results:", error);
    return NextResponse.json(
      { error: "Failed to fetch race results" },
      { status: 500 }
    );
  }
}

// Helper function to calculate scores for all bets on a race
async function calculateBetScores(raceId: string) {
  try {
    // Get all bets for this race
    const raceBets = await db.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    // Get race results
    const raceResults = await db.query.results.findMany({
      where: eq(results.raceId, raceId),
    });

    // Get race for fastest lap driver
    const race = await db.query.races.findFirst({
      where: eq(races.id, raceId),
    });

    if (!race) return;

    // Calculate scores for each bet
    for (const bet of raceBets) {
      const predictions = bet.predictions as Prediction;

      const scoreBreakdown = calculateScore(
        predictions,
        raceResults,
        race.fastestLapDriver || undefined
      );

      // Update bet with score
      await db.update(bets)
        .set({
          score: scoreBreakdown.totalScore,
          scoringDetails: scoreBreakdown,
          updatedAt: new Date(),
        })
        .where(eq(bets.id, bet.id));
    }
  } catch (error) {
    console.error("Error calculating bet scores:", error);
    throw error;
  }
}
