import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET /api/money/budgets/[id] - Get a specific budget with spending data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await db.execute({
      sql: `
        SELECT 
          b.*,
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
        WHERE b.id = ? AND b.user_id = ?
        GROUP BY b.id
      `,
      args: [id, session.user.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/money/budgets/[id] - Update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      category_id,
      name,
      amount,
      period,
      start_date,
      end_date,
      is_active,
      alert_threshold
    } = body;

    // Verify budget exists and belongs to user
    const existingBudget = await db.execute({
      sql: "SELECT id FROM budgets WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    if (existingBudget.rows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const updates = [];
    const args = [];

    if (category_id !== undefined) {
      if (category_id) {
        // Verify category belongs to user
        const categoryCheck = await db.execute({
          sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
          args: [category_id, session.user.id]
        });
        if (categoryCheck.rows.length === 0) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
      }
      updates.push("category_id = ?");
      args.push(category_id);
    }

    if (name !== undefined) {
      updates.push("name = ?");
      args.push(name);
    }

    if (amount !== undefined) {
      updates.push("amount = ?");
      args.push(amount);
    }

    if (period !== undefined) {
      if (!["weekly", "monthly", "yearly"].includes(period)) {
        return NextResponse.json({ 
          error: "Period must be 'weekly', 'monthly', or 'yearly'" 
        }, { status: 400 });
      }
      updates.push("period = ?");
      args.push(period);
    }

    if (start_date !== undefined) {
      updates.push("start_date = ?");
      args.push(Math.floor(new Date(start_date).getTime() / 1000));
    }

    if (end_date !== undefined) {
      updates.push("end_date = ?");
      args.push(end_date ? Math.floor(new Date(end_date).getTime() / 1000) : null);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      args.push(is_active ? 1 : 0);
    }

    if (alert_threshold !== undefined) {
      updates.push("alert_threshold = ?");
      args.push(alert_threshold);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = ?");
    args.push(Math.floor(Date.now() / 1000));
    args.push(id);
    args.push(session.user.id);

    await db.execute({
      sql: `UPDATE budgets SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      args
    });

    const result = await db.execute({
      sql: `
        SELECT 
          b.*,
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
        WHERE b.id = ?
        GROUP BY b.id
      `,
      args: [id]
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/money/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify budget exists and belongs to user
    const existingBudget = await db.execute({
      sql: "SELECT id FROM budgets WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    if (existingBudget.rows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Delete the budget
    await db.execute({
      sql: "DELETE FROM budgets WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}