#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.development.local') });

async function migrateProfile() {
  try {
    console.log('Adding profile fields to users table...');
    
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    
    // Add profile fields to users table
    await db.execute(`
      ALTER TABLE users ADD COLUMN age INTEGER
    `);
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN gender TEXT
    `);
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN height REAL
    `);
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN weight REAL
    `);
    
    console.log('Profile fields migration completed successfully!');
  } catch (error) {
    // Check if columns already exist
    if (error instanceof Error && error.message.includes('duplicate column name')) {
      console.log('Profile fields already exist, skipping migration.');
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

migrateProfile();