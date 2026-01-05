import { db } from "../lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function seedAdmin() {
  try {
    const email = "admin@gmail.com";
    const password = "test";
    const name = "Admin";
    const role = "admin";

    // Check if admin already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email, hashedPassword, name, role],
    });

    console.log("Admin user created successfully");
    console.log("Email: admin@gmail.com");
    console.log("Password: test");
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

seedAdmin();
