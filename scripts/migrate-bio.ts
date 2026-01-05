#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateBio() {
  try {
    console.log('Adding bio column to users table...');
    
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    
    // Add bio column if it doesn't exist
    await db.execute(`
      ALTER TABLE users ADD COLUMN bio TEXT
    `);
    
    console.log('✅ Bio column added successfully');
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ Bio column already exists');
    } else {
      console.error('❌ Error adding bio column:', error);
      process.exit(1);
    }
  }
}

migrateBio();