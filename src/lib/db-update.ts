import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Run this script to update the database schema
 * It will add missing columns to existing tables
 */
export async function updateSchema() {
  try {
    console.log("Starting schema update...");

    // For SQLite, we need to check if the column exists in a different way
    // First, get the table info
    const tableInfo = await db.select().from(users);

    // Check if the password property exists in the first row
    const hasPasswordColumn = tableInfo.length > 0 && 'password' in tableInfo[0];

    if (!hasPasswordColumn) {
      console.log("Adding password column to users table...");

      try {
        // Add password column to users table
        // Note: SQLite has limited ALTER TABLE support
        await db.execute(sql`ALTER TABLE users ADD COLUMN password TEXT;`);
        console.log("Password column added successfully");
      } catch (error) {
        // If the column already exists, this will fail, but we can ignore it
        console.log("Error adding password column (might already exist):", error);
      }
    } else {
      console.log("Password column already exists");
    }

    console.log("Schema update completed successfully");
  } catch (error) {
    console.error("Error updating schema:", error);
    throw error;
  }
}

/**
 * Initialize the database with the updated schema
 */
export async function initializeDatabase() {
  try {
    console.log("Initializing database with password support...");
    await updateSchema();
    console.log("Database initialization completed");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}
