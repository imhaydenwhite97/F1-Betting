import { db, generateId } from "@/lib/db";
import { bets, races } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Updated import

// GET /api/bets - Get all bets for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userBets = await db.query.bets.findMany({
      where: eq(bets.userId, session.user.id),
      with: {
        race: true,
      },
      orderBy: (bets, { desc }) => [desc(bets.createdAt)],
    });

    return NextResponse.json(userBets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.raceId || !data.predictions) {
      return NextResponse.json(
        { error: "Missing required fields: raceId and predictions" },
        { status: 400 }
      );
    }

    // Check if race exists and betting is still open
    const race = await db.query.races.findFirst({
      where: eq(races.id, data.raceId),
    });

    if (!race) {
      return NextResponse.json(
        { error: "Race not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (race.bettingDeadline < now) {
      return NextResponse.json(
        { error: "Betting is closed for this race" },
        { status: 400 }
      );
    }

    // Check if user already has a bet for this race
    const existingBet = await db.query.bets.findFirst({
      where: and(
        eq(bets.userId, session.user.id),
        eq(bets.raceId, data.raceId)
      ),
    });

    if (existingBet) {
      // Update existing bet
      await db.update(bets)
        .set({
          predictions: data.predictions,
          updatedAt: new Date(),
        })
        .where(eq(bets.id, existingBet.id));

      const updatedBet = await db.query.bets.findFirst({
        where: eq(bets.id, existingBet.id),
      });

      return NextResponse.json(updatedBet);
    } else {
      // Create new bet
      const betId = generateId();

      await db.insert(bets).values({
        id: betId,
        userId: session.user.id,
        raceId: data.raceId,
        predictions: data.predictions,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newBet = await db.query.bets.findFirst({
        where: eq(bets.id, betId),
      });

      return NextResponse.json(newBet, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Failed to create bet" },
      { status: 500 }
    );
  }
}
