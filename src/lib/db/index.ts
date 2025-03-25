import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import * as schema from './schema';
import { join } from 'path';
import fs from 'fs';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

// Determine if we're in a production environment (Vercel)
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Database configuration
const DB_PATH = './data';
let DB_FILE = join(DB_PATH, 'f1-fantasy.db');

// Ensure database directory exists in development
if (!isProduction) {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }
}

// Initialize SQLite database with appropriate error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite: any;
let dbInstance: BetterSQLite3Database<typeof schema>;

if (isVercel) {
  // On Vercel, use an in-memory database
  // Note: This means data will be reset on each deployment and between serverless function invocations
  DB_FILE = ':memory:';
}

try {
  sqlite = new Database(DB_FILE);

  // Add query capability to the database client
  dbInstance = drizzle(sqlite, {
    schema,
    logger: !isProduction, // Only log queries in development
  });

} catch (error) {
  console.error('Error initializing SQLite database:', error);

  // If there's an error, try recreating the database file (in development only)
  if (!isProduction && !isVercel) {
    try {
      if (fs.existsSync(DB_FILE)) {
        fs.unlinkSync(DB_FILE);
      }
      sqlite = new Database(DB_FILE);
      dbInstance = drizzle(sqlite, { schema });
    } catch (secondError) {
      console.error('Fatal error initializing SQLite database:', secondError);
      throw secondError;
    }
  } else {
    // In production, especially on Vercel, fail gracefully
    console.error('Database initialization failed in production environment');
    // Create an in-memory database as fallback
    sqlite = new Database(':memory:');
    dbInstance = drizzle(sqlite, { schema });
  }
}

// Export the database client with proper type
export const db = dbInstance;

// Helper to generate unique IDs
export const generateId = () => createId();

// Initialize the database
export function initializeDatabase() {
  console.log("Running database initialization...");
  try {
    // Create Tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE,
        password TEXT,
        image TEXT,
        is_admin INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS races (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        date INTEGER NOT NULL,
        season INTEGER NOT NULL,
        round INTEGER NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        betting_deadline INTEGER NOT NULL,
        fastest_lap_driver TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        team TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY NOT NULL,
        race_id TEXT NOT NULL,
        driver_id TEXT NOT NULL,
        position INTEGER,
        dnf INTEGER NOT NULL DEFAULT 0,
        fastest_lap INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id),
        UNIQUE(race_id, driver_id)
      );

      CREATE TABLE IF NOT EXISTS bets (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        race_id TEXT NOT NULL,
        predictions TEXT NOT NULL,
        score INTEGER,
        scoring_details TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
        UNIQUE(user_id, race_id)
      );
    `);

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
}
