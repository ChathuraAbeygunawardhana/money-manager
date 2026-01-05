import { db } from "../lib/db";
import { encryptPassword } from "../lib/crypto";
import { randomUUID } from "crypto";

async function createNewAdmin() {
  try {
    const email = "newadmin@gmail.com";
    const password = "admin123";
    const name = "New Admin";
    const role = "admin";

    // Check if this admin already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      console.log("New admin user already exists");
      return;
    }

    const encryptedPassword = encryptPassword(password);
    const userId = randomUUID();

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email, encryptedPassword, name, role],
    });

    console.log("✅ New admin user created successfully!");
    console.log("📧 Email: newadmin@gmail.com");
    console.log("🔑 Password: admin123");
    console.log("👤 This user has an encrypted password that can be viewed in the admin dashboard");

  } catch (error) {
    console.error("❌ Error creating new admin:", error);
  }
}

createNewAdmin();