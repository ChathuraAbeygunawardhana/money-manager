# Database Scripts

## Available Scripts

### migrate-add-role.js
Adds the `role` column to the existing `users` table.

**Usage:**
```bash
npm run migrate:role
```

**When to use:**
- Run this once if you have an existing database without the role column
- Safe to run multiple times (checks if column exists first)

### seed-admin.js
Creates an admin user with predefined credentials.

**Usage:**
```bash
npm run seed:admin
```

**Credentials:**
- Email: admin@gmail.com
- Password: test

**When to use:**
- After running the migration
- When you need to create the admin account
- Safe to run multiple times (checks if admin exists first)

### add-admins-to-chatrooms.js
Adds all admin users as members to all existing chatrooms.

**Usage:**
```bash
npm run add-admins
```

**When to use:**
- After creating the admin user if you have existing chatrooms
- When you want to ensure all admins have access to all chatrooms
- Safe to run multiple times (checks if admin is already a member)

## Setup Order

For a fresh setup or existing database:
1. `npm run migrate:role` - Add role column (if needed)
2. `npm run seed:admin` - Create admin user
3. `npm run add-admins` - Add admins to existing chatrooms (optional, only if you have existing chatrooms)
