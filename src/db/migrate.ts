import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// This script runs migrations on the database
async function main() {
  try {
    console.log("Connecting to database...");
    const client = neon(process.env.DATABASE_URL!);
    const db = drizzle({ client });

    console.log("Starting migration...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

main();