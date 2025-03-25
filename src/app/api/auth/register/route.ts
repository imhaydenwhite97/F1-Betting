import { NextRequest, NextResponse } from "next/server";
import { db, generateId } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, validatePassword } from "@/lib/auth/password";

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'username', 'password'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error || "Invalid password" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Check if username is already taken
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password);

    // Generate a unique user ID
    const userId = generateId();

    // Create the user
    await db.insert(users).values({
      id: userId,
      name: data.name,
      email: data.email,
      username: data.username,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return the new user (excluding sensitive fields)
    const newUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
