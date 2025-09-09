import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

// Load environment variables
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function setupDatabase() {
  console.log("Setting up database...");

  try {
    // Drop all existing tables and types
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

    // Create enums
    await db.execute(sql`CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent')`);
    await db.execute(sql`CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard')`);
    await db.execute(sql`CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled')`);

    // Create projects table
    await db.execute(sql`
      CREATE TABLE projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        area TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create tasks table
    await db.execute(sql`
      CREATE TABLE tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID REFERENCES projects(id) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        checklist TEXT,
        priority priority DEFAULT 'medium' NOT NULL,
        difficulty difficulty DEFAULT 'medium' NOT NULL,
        due_date TIMESTAMP,
        status task_status DEFAULT 'todo' NOT NULL,
        area TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP
      )
    `);

    // Create notes table
    await db.execute(sql`
      CREATE TABLE notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id UUID REFERENCES projects(id) NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        area TEXT NOT NULL,
        sub_areas TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Create idea_dumps table
    await db.execute(sql`
      CREATE TABLE idea_dumps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        raw_content TEXT NOT NULL,
        processed_content TEXT,
        processing_status TEXT DEFAULT 'pending' NOT NULL,
        result_type TEXT,
        result_id UUID,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        processed_at TIMESTAMP
      )
    `);

    console.log("Database setup completed successfully!");

  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("Database setup script finished.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database setup failed:", error);
      process.exit(1);
    });
}

export { setupDatabase };