import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@libsql/client";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.development.local") });

async function migrate() {
  try {
    console.log("Adding problem_reports table...");

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    await db.execute(`
      CREATE TABLE IF NOT EXISTS problem_reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        chatroom_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (chatroom_id) REFERENCES chatrooms(id) ON DELETE SET NULL
      )
    `);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
