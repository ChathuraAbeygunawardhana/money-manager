#!/usr/bin/env tsx

import { db } from '../lib/db';

async function migrateOrientation() {
  try {
    console.log('Adding orientation column to users table...');
    
    // Add orientation column to existing users table if it doesn't exist
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN orientation TEXT
    `);
    
    console.log('✅ Successfully added orientation column to users table');
  } catch (error: any) {
    if (error.message?.includes("duplicate column name")) {
      console.log('ℹ️  Orientation column already exists, skipping migration');
    } else {
      console.error('❌ Error adding orientation column:', error);
      throw error;
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateOrientation()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateOrientation };