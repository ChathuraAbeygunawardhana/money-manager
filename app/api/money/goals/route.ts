import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// GET /api/money/goals - Get all financial goals for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("is_active");

    let sql = `
      SELECT 
        id, name, description, target_amount, current_amount, target_date,
        category, priority, is_active, created_at, updated_at
      FROM financial_goals 
      WHERE user_id = ?
    `;
    const args = [session.user.id];

    if (category) {
      sql += " AND category = ?";
      args.push(category);
    }

    if (isActive !== null) {
      sql += " AND is_active = ?";
      args.push(isActive === "true" ? 1 : 0);
    }

    sql += " ORDER BY priority DESC, created_at DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching financial goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/money/goals - Create a new financial goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      target_amount,
      current_amount = 0,
      target_date,
      category,
      priority = "medium"
    } = body;

    if (!name || !target_amount) {
      return NextResponse.json({ 
        error: "Name and target amount are required" 
      }, { status: 400 });
    }

    const validCategories = [
      "emergency_fund", "vacation", "house", "car", "education", "retirement", "other"
    ];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const goalId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const targetDate = target_date ? Math.floor(new Date(target_date).getTime() / 1000) : null;

    await db.execute({
      sql: `
        INSERT INTO financial_goals (
          id, user_id, name, description, target_amount, current_amount,
          target_date, category, priority, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        goalId, session.user.id, name, description, target_amount, current_amount,
        targetDate, category, priority, now, now
      ]
    });

    const result = await db.execute({
      sql: "SELECT * FROM financial_goals WHERE id = ?",
      args: [goalId]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating financial goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}