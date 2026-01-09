import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// GET /api/money/categories/[id] - Get a specific category
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
        SELECT * FROM categories 
        WHERE id = ? AND user_id = ? AND is_active = 1
      `,
      args: [id, session.user.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/money/categories/[id] - Update a category
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
    const { name, type, color, icon } = body;

    // Verify category exists and belongs to user
    const existingCategory = await db.execute({
      sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
      args: [id, session.user.id]
    });

    if (existingCategory.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updates = [];
    const args = [];

    if (name !== undefined) {
      updates.push("name = ?");
      args.push(name);
    }
    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return NextResponse.json({ error: "Type must be 'income' or 'expense'" }, { status: 400 });
      }
      updates.push("type = ?");
      args.push(type);
    }
    if (color !== undefined) {
      updates.push("color = ?");
      args.push(color);
    }
    if (icon !== undefined) {
      updates.push("icon = ?");
      args.push(icon);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    args.push(id);
    args.push(session.user.id);

    await db.execute({
      sql: `UPDATE categories SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      args
    });

    const result = await db.execute({
      sql: "SELECT * FROM categories WHERE id = ?",
      args: [id]
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/money/categories/[id] - Soft delete a category
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

    // Verify category exists and belongs to user
    const existingCategory = await db.execute({
      sql: "SELECT id FROM categories WHERE id = ? AND user_id = ? AND is_active = 1",
      args: [id, session.user.id]
    });

    if (existingCategory.rows.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Soft delete the category
    await db.execute({
      sql: "UPDATE categories SET is_active = 0 WHERE id = ? AND user_id = ?",
      args: [id, session.user.id]
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}