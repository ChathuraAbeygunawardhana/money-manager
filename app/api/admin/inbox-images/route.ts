import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all image messages from direct_messages table
    const result = await db.execute({
      sql: `
        SELECT 
          dm.id,
          dm.image_url,
          dm.content,
          dm.created_at,
          sender.name as sender_name,
          sender.email as sender_email,
          recipient.name as recipient_name,
          recipient.email as recipient_email
        FROM direct_messages dm
        JOIN users sender ON dm.sender_id = sender.id
        JOIN users recipient ON dm.recipient_id = recipient.id
        WHERE dm.message_type = 'image' AND dm.image_url IS NOT NULL
        ORDER BY dm.created_at DESC
      `,
      args: []
    });

    const images = result.rows.map((row: any) => ({
      id: row.id,
      imageUrl: row.image_url,
      content: row.content,
      createdAt: row.created_at,
      sender: {
        name: row.sender_name,
        email: row.sender_email
      },
      recipient: {
        name: row.recipient_name,
        email: row.recipient_email
      }
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Failed to fetch inbox images:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox images" },
      { status: 500 }
    );
  }
}