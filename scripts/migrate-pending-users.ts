import { config } from "dotenv";
import { db } from "../lib/db";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env.development.local" });

async function migratePendingUsers() {
  try {
    console.log("Starting pending users migration...");

    // Create pending_users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pending_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        email_verification_token TEXT NOT NULL,
        email_verification_expires INTEGER NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);
    console.log("✓ Created pending_users table");

    // Move unverified users to pending_users table
    const unverifiedUsers = await db.execute({
      sql: "SELECT * FROM users WHERE email_verified = 0 AND email_verification_token IS NOT NULL",
      args: [],
    });

    if (unverifiedUsers.rows.length > 0) {
      console.log(`Found ${unverifiedUsers.rows.length} unverified users to migrate`);

      for (const user of unverifiedUsers.rows) {
        try {
          await db.execute({
            sql: "INSERT INTO pending_users (id, email, password, name, role, email_verification_token, email_verification_expires, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
              user.id,
              user.email,
              user.password,
              user.name,
              user.role,
              user.email_verification_token,
              user.email_verification_expires,
              user.created_at,
            ],
          });

          await db.execute({
            sql: "DELETE FROM users WHERE id = ?",
            args: [user.id],
          });

          console.log(`✓ Migrated user: ${user.email}`);
        } catch (error) {
          console.error(`✗ Failed to migrate user ${user.email}:`, error);
        }
      }
    } else {
      console.log("No unverified users to migrate");
    }

    // Remove email verification columns from users table (SQLite doesn't support DROP COLUMN easily)
    // Instead, we'll just leave them and set defaults appropriately
    console.log("✓ Migration completed successfully");
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migratePendingUsers();
