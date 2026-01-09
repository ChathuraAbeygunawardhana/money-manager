import { db } from "../lib/db";
import { randomUUID } from "crypto";

// Default user ID for demo purposes
const DEFAULT_USER_ID = "demo-user-123";

async function migrateCategories() {
  try {
    console.log("Starting category migration...");

    // Delete existing categories for the demo user
    await db.execute({
      sql: "DELETE FROM categories WHERE user_id = ?",
      args: [DEFAULT_USER_ID]
    });

    console.log("Deleted existing categories");

    const now = Math.floor(Date.now() / 1000);

    // New expense categories
    const expenseCategories = [
      { name: "Entertainment", icon: "film", color: "#9CA3AF" },
      { name: "Food & Dining", icon: "utensils", color: "#EF4444" },
      { name: "Personal Care", icon: "user", color: "#DC2626" },
      { name: "Rent", icon: "home", color: "#16A34A" },
      { name: "Shopping", icon: "shopping-bag", color: "#DC2626" },
      { name: "Transportation", icon: "car", color: "#6B7280" },
      { name: "Travel", icon: "plane", color: "#10B981" },
      { name: "Phone Bills Dialog", icon: "phone", color: "#3B82F6" },
      { name: "Phone Bills Hutch", icon: "smartphone", color: "#F59E0B" },
      { name: "Major Purchases", icon: "credit-card", color: "#8B5CF6" }
    ];

    // Keep the same income categories
    const incomeCategories = [
      { name: "Salary", icon: "briefcase", color: "#16A34A" },
      { name: "Freelance", icon: "laptop", color: "#10B981" },
      { name: "Business", icon: "building", color: "#6B7280" },
      { name: "Investments", icon: "trending-up", color: "#DC2626" },
      { name: "Rental Income", icon: "home", color: "#9CA3AF" },
      { name: "Side Hustle", icon: "zap", color: "#22C55E" },
      { name: "Gifts Received", icon: "gift", color: "#EF4444" },
      { name: "Refunds", icon: "refresh-cw", color: "#6B7280" },
      { name: "Other Income", icon: "plus", color: "#16A34A" }
    ];

    // Insert new expense categories
    for (const category of expenseCategories) {
      await db.execute({
        sql: `
          INSERT INTO categories (id, user_id, name, type, color, icon, created_at)
          VALUES (?, ?, ?, 'expense', ?, ?, ?)
        `,
        args: [randomUUID(), DEFAULT_USER_ID, category.name, category.color, category.icon, now]
      });
    }

    // Insert income categories
    for (const category of incomeCategories) {
      await db.execute({
        sql: `
          INSERT INTO categories (id, user_id, name, type, color, icon, created_at)
          VALUES (?, ?, ?, 'income', ?, ?, ?)
        `,
        args: [randomUUID(), DEFAULT_USER_ID, category.name, category.color, category.icon, now]
      });
    }

    console.log(`Migration completed successfully!`);
    console.log(`Created ${expenseCategories.length} expense categories`);
    console.log(`Created ${incomeCategories.length} income categories`);

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateCategories();