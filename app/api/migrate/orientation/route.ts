import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can run migrations" }, { status: 403 });
    }

    console.log('Adding orientation column to users table...');
    
    // Add orientation column to existing users table if it doesn't exist
    try {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN orientation TEXT
      `);
      
      console.log('✅ Successfully added orientation column to users table');
      return NextResponse.json({ 
        success: true, 
        message: "Successfully added orientation column to users table" 
      });
    } catch (error: any) {
      if (error.message?.includes("duplicate column name")) {
        console.log('ℹ️  Orientation column already exists, skipping migration');
        return NextResponse.json({ 
          success: true, 
          message: "Orientation column already exists, no migration needed" 
        });
      } else {
        console.error('❌ Error adding orientation column:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}