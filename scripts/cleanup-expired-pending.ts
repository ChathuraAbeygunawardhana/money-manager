import { config } from "dotenv";
import { db } from "../lib/db";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env.development.local" });

async function cleanupExpiredPendingUsers() {
  try {
    console.log("Starting cleanup of expired pending users...");

    const currentTime = Math.floor(Date.now() / 1000);
    
    const result = await db.execute({
      sql: "DELETE FROM pending_users WHERE email_verification_expires < ?",
      args: [currentTime],
    });

    console.log(`✓ Cleaned up ${result.rowsAffected} expired pending users`);
    
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

cleanupExpiredPendingUsers();