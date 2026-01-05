import { db } from '../lib/db';

async function verifyExistingUsers() {
  try {
    console.log('Marking existing users as verified...');
    
    // Mark all existing users as verified
    const result = await db.execute(`
      UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0
    `);
    
    console.log(`Updated ${result.rowsAffected} users as verified`);
    console.log('Existing users can now sign in without email verification');
  } catch (error) {
    console.error('Error verifying existing users:', error);
  }
}

verifyExistingUsers();