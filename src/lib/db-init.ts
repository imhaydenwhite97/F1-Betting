import { initializeDatabase as initDbSchema, db, generateId } from './db';
import { drivers, races, users } from './db/schema';
import { addDays, subDays } from 'date-fns';
import { initializeDatabase as updatePasswordSchema } from './db-update';
import { hashPassword, simpleHash } from './auth/password';

// Initialize the database schema
export async function initDb() {
  try {
    console.log('Starting database initialization...');
    // Create database tables
    initDbSchema();

    // Ensure password column exists
    await updatePasswordSchema();

    console.log('Database tables created successfully');

    // Seed the database with initial data if empty
    await seedIfEmpty();

    console.log('Database initialization completed');
    return { success: true, message: 'Database initialized and seeded successfully' };
  } catch (error) {
    console.error('Error during database initialization:', error);
    return { success: false, error: String(error) };
  }
}

// Add sample data if the database is empty
async function seedIfEmpty() {
  try {
    // Check if we already have data
    console.log('Checking for existing data...');
    const existingDrivers = await db.query.drivers.findMany();

    if (existingDrivers.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with initial data...');

    // Generate secure password hashes for default accounts
    const adminPassword = await hashPassword('Admin123!');
    const userPassword = await hashPassword('Testing123!');

    // Create an admin user
    console.log('Creating admin user...');
    const adminId = generateId();
    await db.insert(users).values({
      id: adminId,
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin_f1',
      password: adminPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a regular user
    console.log('Creating test user...');
    const userId = generateId();
    await db.insert(users).values({
      id: userId,
      name: 'Test User',
      email: 'user@example.com',
      username: 'f1_fan',
      password: userPassword,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add current F1 drivers
    console.log('Adding F1 drivers...');
    const driverData = [
      { name: 'Max Verstappen', number: 1, team: 'Red Bull Racing', code: 'VER' },
      { name: 'Sergio Perez', number: 11, team: 'Red Bull Racing', code: 'PER' },
      { name: 'Charles Leclerc', number: 16, team: 'Ferrari', code: 'LEC' },
      { name: 'Carlos Sainz', number: 55, team: 'Ferrari', code: 'SAI' },
      { name: 'Lewis Hamilton', number: 44, team: 'Mercedes', code: 'HAM' },
      { name: 'George Russell', number: 63, team: 'Mercedes', code: 'RUS' },
      { name: 'Lando Norris', number: 4, team: 'McLaren', code: 'NOR' },
      { name: 'Oscar Piastri', number: 81, team: 'McLaren', code: 'PIA' },
      { name: 'Fernando Alonso', number: 14, team: 'Aston Martin', code: 'ALO' },
      { name: 'Lance Stroll', number: 18, team: 'Aston Martin', code: 'STR' },
      { name: 'Esteban Ocon', number: 31, team: 'Alpine', code: 'OCO' },
      { name: 'Pierre Gasly', number: 10, team: 'Alpine', code: 'GAS' },
      { name: 'Daniel Ricciardo', number: 3, team: 'RB', code: 'RIC' },
      { name: 'Yuki Tsunoda', number: 22, team: 'RB', code: 'TSU' },
      { name: 'Alexander Albon', number: 23, team: 'Williams', code: 'ALB' },
      { name: 'Logan Sargeant', number: 2, team: 'Williams', code: 'SAR' },
      { name: 'Valtteri Bottas', number: 77, team: 'Kick Sauber', code: 'BOT' },
      { name: 'Zhou Guanyu', number: 24, team: 'Kick Sauber', code: 'ZHO' },
      { name: 'Kevin Magnussen', number: 20, team: 'Haas F1 Team', code: 'MAG' },
      { name: 'Nico Hulkenberg', number: 27, team: 'Haas F1 Team', code: 'HUL' },
    ];

    for (const driver of driverData) {
      await db.insert(drivers).values({
        id: generateId(),
        name: driver.name,
        number: driver.number,
        team: driver.team,
        code: driver.code,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log('Added all drivers');

    // Add some races
    console.log('Adding sample races...');
    const now = new Date();

    // Past race
    const pastRaceId = generateId();
    await db.insert(races).values({
      id: pastRaceId,
      name: 'Australian Grand Prix',
      location: 'Melbourne',
      date: subDays(now, 10),
      season: 2025,
      round: 3,
      isCompleted: true,
      isActive: false,
      bettingDeadline: subDays(now, 11),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Current race
    const currentRaceId = generateId();
    await db.insert(races).values({
      id: currentRaceId,
      name: 'Japanese Grand Prix',
      location: 'Suzuka',
      date: addDays(now, 5),
      season: 2025,
      round: 4,
      isCompleted: false,
      isActive: true,
      bettingDeadline: addDays(now, 4),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Future race
    const futureRaceId = generateId();
    await db.insert(races).values({
      id: futureRaceId,
      name: 'Miami Grand Prix',
      location: 'Miami',
      date: addDays(now, 20),
      season: 2025,
      round: 5,
      isCompleted: false,
      isActive: true,
      bettingDeadline: addDays(now, 19),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
