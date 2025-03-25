import { db } from "@/lib/db";
import { bets, races } from "@/lib/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/winners - Get recent winners by score
export async function GET() {
  try {
    // Modify the query to select only the fields we're sure exist
    const winners = await db.query.bets.findMany({
      where: isNotNull(bets.score),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
            // username might not exist in older records, so we don't select it explicitly
          }
        },
        race: true,
      },
      orderBy: [desc(bets.score)],
      limit: 10,
    });

    return NextResponse.json(winners);
  } catch (error) {
    console.error("Error fetching winners:", error);
    return NextResponse.json(
      { error: "Failed to fetch winners", details: String(error) },
      { status: 500 }
    );
  }
}
