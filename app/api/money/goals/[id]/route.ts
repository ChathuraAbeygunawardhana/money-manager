import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET /api/money/goals/[id] - Get a specific financial goal
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
      sql: "SELECT * FROM financial_goals WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Financial goal not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching financial goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/money/goals/[id] - Update a financial goal
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
      name,
      description,
      target_amount,
      current_amount,
      target_date,
      category,
      priority,
      is_active
    } = body;

    // Verify goal exists and belongs to user
    const existingGoal = await db.execute({
      sql: "SELECT id FROM financial_goals WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    if (existingGoal.rows.length === 0) {
      return NextResponse.json({ error: "Financial goal not found" }, { status: 404 });
    }

    const updates = [];
    const args = [];

    if (name !== undefined) {
      updates.push("name = ?");
      args.push(name);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      args.push(description);
    }

    if (target_amount !== undefined) {
      updates.push("target_amount = ?");
      args.push(target_amount);
    }

    if (current_amount !== undefined) {
      updates.push("current_amount = ?");
      args.push(current_amount);
    }

    if (target_date !== undefined) {
      updates.push("target_date = ?");
      args.push(target_date ? Math.floor(new Date(target_date).getTime() / 1000) : null);
    }

    if (category !== undefined) {
      const validCategories = [
        "emergency_fund", "vacation", "house", "car", "education", "retirement", "other"
      ];
      if (category && !validCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      updates.push("category = ?");
      args.push(category);
    }

    if (priority !== undefined) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      updates.push("priority = ?");
      args.push(priority);
    }

    if (is_active !== undefined) {
      updates.push("is_active = ?");
      args.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = ?");
    args.push(Math.floor(Date.now() / 1000));
    args.push(id);
    args.push(session.user.id);

    await db.execute({
      sql: `UPDATE financial_goals SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      args
    });

    const result = await db.execute({
      sql: "SELECT * FROM financial_goals WHERE id = ?",
      args: [id]
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating financial goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/money/goals/[id] - Delete a financial goal
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

    // Verify goal exists and belongs to user
    const existingGoal = await db.execute({
      sql: "SELECT id FROM financial_goals WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    if (existingGoal.rows.length === 0) {
      return NextResponse.json({ error: "Financial goal not found" }, { status: 404 });
    }

    // Delete the goal
    await db.execute({
      sql: "DELETE FROM financial_goals WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    return NextResponse.json({ message: "Financial goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting financial goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}