import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

// GET /api/money/budgets - Get all budgets for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const isActive = searchParams.get("is_active");

    let sql = `
      SELECT 
        b.id, b.name, b.amount, b.period, b.start_date, b.end_date,
        b.is_active, b.alert_threshold, b.created_at, b.updated_at,
        c.name as category_name, c.color as category_color, c.icon as category_icon,
        COALESCE(SUM(CASE 
          WHEN t.type = 'expense' AND t.date >= b.start_date 
          AND (b.end_date IS NULL OR t.date <= b.end_date)
          THEN t.amount 
          ELSE 0 
        END), 0) as spent_amount
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON (b.category_id IS NULL OR t.category_id = b.category_id) 
        AND t.user_id = b.user_id
      WHERE b.user_id = ?
    `;
    const args = [session.user.id];

    if (period && ["weekly", "monthly", "yearly"].includes(period)) {
      sql += " AND b.period = ?";
      args.push(period);
    }

    if (isActive !== null) {
      sql += " AND b.is_active = ?";
      args.push(isActive === "true" ? 1 : 0);
    }

    sql += " GROUP BY b.id ORDER BY b.created_at DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/money/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      category_id,
      name,
      amount,
      period,
      start_date,
      end_date,
      alert_threshold = 0.8
    } = body;

    if (!name || !amount || !period || !start_date) {
      return NextResponse.json({ 
        error: "Name, amount, period, and start_date are required" 
      }, { status: 400 });
    }

    if (!["weekly", "monthly", "yearly"].includes(period)) {
      return NextResponse.json({ 
        error: "Period must be 'weekly', 'monthly', or 'yearly'" 
      }, { status: 400 });
    }

    // Verify category belongs to user (if provided)
    if (category_id) {
      const categoryCheck = await db.execute({
        sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
        args: [category_id, session.user.id]
      });

      if (categoryCheck.rows.length === 0) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const budgetId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const startDate = Math.floor(new Date(start_date).getTime() / 1000);
    const endDate = end_date ? Math.floor(new Date(end_date).getTime() / 1000) : null;

    await db.execute({
      sql: `
        INSERT INTO budgets (
          id, user_id, category_id, name, amount, period, start_date, end_date,
          alert_threshold, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        budgetId, session.user.id, category_id, name, amount, period,
        startDate, endDate, alert_threshold, now, now
      ]
    });

    const result = await db.execute({
      sql: `
        SELECT 
          b.*, 
          c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      args: [budgetId]
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}