import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: '.env.development.local' });
config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migratePasswordReset() {
  try {
    console.log('Adding password reset columns to users table...');
    
    // Add password reset columns to existing users table if they don't exist
    try {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN password_reset_token TEXT
      `);
      console.log('✓ Added password_reset_token column');
    } catch (error: any) {
      if (error.message?.includes("duplicate column name")) {
        console.log('✓ password_reset_token column already exists');
      } else {
        throw error;
      }
    }

    try {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN password_reset_expires INTEGER
      `);
      console.log('✓ Added password_reset_expires column');
    } catch (error: any) {
      if (error.message?.includes("duplicate column name")) {
        console.log('✓ password_reset_expires column already exists');
      } else {
        throw error;
      }
    }

    console.log('Password reset migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePasswordReset();