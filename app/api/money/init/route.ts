import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// Default user ID for demo purposes (no authentication required)
const DEFAULT_USER_ID = "demo-user-123";

// POST /api/money/init - Initialize money manager for demo user with default categories
export async function POST() {
  try {
    // First, ensure the demo user exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [DEFAULT_USER_ID]
    });

    if (existingUser.rows.length === 0) {
      // Create the demo user
      const now = Math.floor(Date.now() / 1000);
      await db.execute({
        sql: `
          INSERT INTO users (id, email, password, name, role, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [DEFAULT_USER_ID, "demo@example.com", "demo", "Demo User", "user", now]
      });
    }

    // Check if user already has categories
    const existingCategories = await db.execute({
      sql: "SELECT COUNT(*) as count FROM categories WHERE user_id = ?",
      args: [DEFAULT_USER_ID]
    });

    if (Number(existingCategories.rows[0].count) > 0) {
      return NextResponse.json({ 
        message: "Money manager already initialized for demo user" 
      });
    }

    const now = Math.floor(Date.now() / 1000);

    // Default expense categories
    const expenseCategories = [
      { name: "Food & Dining", icon: "utensils", color: "#EF4444" },
      { name: "Transportation", icon: "car", color: "#6B7280" },
      { name: "Shopping", icon: "shopping-bag", color: "#DC2626" },
      { name: "Entertainment", icon: "film", color: "#9CA3AF" },
      { name: "Bills & Utilities", icon: "receipt", color: "#10B981" },
      { name: "Healthcare", icon: "heart", color: "#EF4444" },
      { name: "Education", icon: "book", color: "#6B7280" },
      { name: "Travel", icon: "plane", color: "#10B981" },
      { name: "Home & Garden", icon: "home", color: "#16A34A" },
      { name: "Personal Care", icon: "user", color: "#DC2626" },
      { name: "Insurance", icon: "shield", color: "#6B7280" },
      { name: "Taxes", icon: "calculator", color: "#DC2626" },
      { name: "Gifts & Donations", icon: "gift", color: "#EF4444" },
      { name: "Other Expenses", icon: "more-horizontal", color: "#64748B" }
    ];

    // Default income categories
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

    // Insert expense categories
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

    // Create a default checking account
    await db.execute({
      sql: `
        INSERT INTO accounts (id, user_id, name, type, balance, currency, created_at, updated_at)
        VALUES (?, ?, 'Main Checking', 'checking', 0, 'USD', ?, ?)
      `,
      args: [randomUUID(), DEFAULT_USER_ID, now, now]
    });

    return NextResponse.json({ 
      message: "Money manager initialized successfully",
      categories_created: expenseCategories.length + incomeCategories.length,
      accounts_created: 1
    });
  } catch (error) {
    console.error("Error initializing money manager:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}