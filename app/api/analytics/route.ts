import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  try {
    // Total users
    const totalUsersResult = await db.execute("SELECT COUNT(*) as count FROM users");
    const totalUsers = totalUsersResult.rows[0].count as number;

    // Users by role
    const roleStatsResult = await db.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    const roleStats = roleStatsResult.rows.map(row => ({
      role: row.role as string,
      count: row.count as number
    }));

    // Total chatrooms
    const totalChatroomsResult = await db.execute("SELECT COUNT(*) as count FROM chatrooms");
    const totalChatrooms = totalChatroomsResult.rows[0].count as number;

    // Total messages
    const totalMessagesResult = await db.execute("SELECT COUNT(*) as count FROM messages");
    const totalMessages = totalMessagesResult.rows[0].count as number;

    // Active users (users who have sent at least one message)
    const activeUsersResult = await db.execute(`
      SELECT COUNT(DISTINCT user_id) as count FROM messages
    `);
    const activeUsers = activeUsersResult.rows[0].count as number;

    // Users with chatroom memberships
    const usersWithMembershipsResult = await db.execute(`
      SELECT COUNT(DISTINCT user_id) as count FROM chatroom_members
    `);
    const usersWithMemberships = usersWithMembershipsResult.rows[0].count as number;

    // Recent users (last 7 days)
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    const recentUsersResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM users WHERE created_at >= ?",
      args: [sevenDaysAgo]
    });
    const recentUsers = recentUsersResult.rows[0].count as number;

    // Most active users (by message count)
    const topUsersResult = await db.execute(`
      SELECT 
        u.name,
        u.email,
        COUNT(m.id) as message_count
      FROM users u
      LEFT JOIN messages m ON u.id = m.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY message_count DESC
      LIMIT 10
    `);
    const topUsers = topUsersResult.rows.map(row => ({
      name: row.name as string,
      email: row.email as string,
      messageCount: row.message_count as number
    }));

    // Chatroom participation stats
    const chatroomStatsResult = await db.execute(`
      SELECT 
        c.name,
        COUNT(DISTINCT cm.user_id) as member_count,
        COUNT(DISTINCT m.id) as message_count
      FROM chatrooms c
      LEFT JOIN chatroom_members cm ON c.id = cm.chatroom_id
      LEFT JOIN messages m ON c.id = m.chatroom_id
      GROUP BY c.id, c.name
      ORDER BY member_count DESC
    `);
    const chatroomStats = chatroomStatsResult.rows.map(row => ({
      name: row.name as string,
      memberCount: row.member_count as number,
      messageCount: row.message_count as number
    }));

    // User list with details
    const usersResult = await db.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT cm.chatroom_id) as chatroom_count,
        COUNT(DISTINCT m.id) as message_count
      FROM users u
      LEFT JOIN chatroom_members cm ON u.id = cm.user_id
      LEFT JOIN messages m ON u.id = m.user_id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);
    const users = usersResult.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      role: row.role as string,
      createdAt: row.created_at as number,
      chatroomCount: row.chatroom_count as number,
      messageCount: row.message_count as number
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalChatrooms,
        totalMessages,
        activeUsers,
        usersWithMemberships,
        recentUsers
      },
      roleStats,
      topUsers,
      chatroomStats,
      users
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
