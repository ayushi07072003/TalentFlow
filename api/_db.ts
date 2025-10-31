// Shared database instance for API routes
import { db } from '../src/lib/db';

// Seed the database if needed
export async function ensureDbSeeded() {
  try {
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      console.log('Seeding database...');
      await db.seed();
      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Initialize database
ensureDbSeeded().catch(console.error);

export { db };