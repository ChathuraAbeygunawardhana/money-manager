import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    console.log('Adding email verification columns...');
    
    // Add email_verified column (0 = false, 1 = true)
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0
    `);
    
    // Add email verification token
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verification_token TEXT
    `);
    
    // Add token expiration timestamp
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verification_expires INTEGER
    `);
    
    console.log('Email verification columns added successfully!');
    
    return NextResponse.json({ 
      message: "Email verification columns added successfully" 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: "Migration failed", details: error },
      { status: 500 }
    );
  }
}