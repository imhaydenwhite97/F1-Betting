import { db, generateId } from "@/lib/db";
import { drivers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Updated import for authOptions

// GET /api/drivers - Get all active drivers
export async function GET() {
  try {
    const allDrivers = await db.query.drivers.findMany({
      where: eq(drivers.isActive, true),
      orderBy: (drivers, { asc }) => [asc(drivers.name)],
    });

    return NextResponse.json(allDrivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}

// POST /api/drivers - Create a new driver (admin only)
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
    const requiredFields = ['name', 'number', 'team', 'code'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if driver code already exists
    const existingDriver = await db.query.drivers.findFirst({
      where: eq(drivers.code, data.code),
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: "Driver with this code already exists" },
        { status: 400 }
      );
    }

    const driverId = generateId();

    await db.insert(drivers).values({
      id: driverId,
      name: data.name,
      number: data.number,
      team: data.team,
      code: data.code,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    return NextResponse.json(newDriver, { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error);
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
}
