// Database initialization script
import { initDb } from '../lib/db-init';

console.log('Starting database initialization');

// Initialize and seed the database
try {
  const result = initDb();
  if (result?.success) {
    console.log('Database initialization successful:', result.message);
    process.exitCode = 0;
  } else {
    console.error('Database initialization failed:', result?.error || 'Unknown error');
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Error during database initialization:', error);
  process.exitCode = 1;
}
