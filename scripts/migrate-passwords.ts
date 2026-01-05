import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db";
import { encryptPassword, isBcryptHash } from "../lib/crypto";

async function migratePasswords() {
  try {
    console.log("🔄 Starting password migration...");

    // Get all users with bcrypt hashes
    const result = await db.execute({
      sql: "SELECT id, email, name, password FROM users",
      args: [],
    });

    const users = result.rows;
    let migratedCount = 0;
    const defaultPassword = "password123"; // Default password for all users

    for (const user of users) {
      const storedPassword = user.password as string;
      
      if (isBcryptHash(storedPassword)) {
        console.log(`📝 Migrating user: ${user.email}`);
        
        const encryptedPassword = encryptPassword(defaultPassword);
        
        await db.execute({
          sql: "UPDATE users SET password = ? WHERE id = ?",
          args: [encryptedPassword, user.id],
        });
        
        migratedCount++;
      } else {
        console.log(`✅ User ${user.email} already has encrypted password`);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total users processed: ${users.length}`);
    console.log(`🔄 Users migrated: ${migratedCount}`);
    console.log(`🔑 Default password for all migrated users: ${defaultPassword}`);
    console.log(`\n⚠️  IMPORTANT: All migrated users should change their passwords!`);

  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
}

migratePasswords();