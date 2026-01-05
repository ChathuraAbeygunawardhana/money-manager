import { db } from '../lib/db';

async function migrateEmailVerification() {
  try {
    console.log('Adding email verification columns...');
    
    // Add email_verified and email_verification_token columns
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0
    `);
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verification_token TEXT
    `);
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verification_expires INTEGER
    `);
    
    console.log('Email verification columns added successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateEmailVerification();