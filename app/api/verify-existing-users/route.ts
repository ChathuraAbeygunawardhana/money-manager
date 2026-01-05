import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log('Marking existing users as verified...');
    
    // Mark all existing users as verified
    const result = await db.execute(`
      UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0
    `);
    
    console.log(`Updated ${result.rowsAffected} users as verified`);
    
    return NextResponse.json({ 
      message: "Existing users marked as verified",
      usersUpdated: result.rowsAffected
    });
  } catch (error) {
    console.error('Error verifying existing users:', error);
    return NextResponse.json(
      { error: "Failed to verify existing users", details: error },
      { status: 500 }
    );
  }
}