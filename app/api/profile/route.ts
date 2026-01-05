import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle basic profile update (name, profile_picture)
    if (body.name !== undefined || body.profile_picture !== undefined) {
      const { name, profile_picture } = body;

      if (name !== undefined && (!name || name.trim().length === 0)) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      // Update user profile
      await db.execute({
        sql: 'UPDATE users SET name = ?, profile_picture = ? WHERE id = ?',
        args: [name?.trim() || null, profile_picture || null, session.user.id]
      });
    }

    // Handle extended profile info update (age, gender, height, weight, bio, orientation)
    if (body.age !== undefined || body.gender !== undefined || body.height !== undefined || body.weight !== undefined || body.bio !== undefined || body.orientation !== undefined) {
      const { age, gender, height, weight, bio, orientation } = body;

      // Validate bio length
      if (bio && bio.length > 50) {
        return NextResponse.json({ error: 'Bio must be less than 50 characters' }, { status: 400 });
      }

      // Validate orientation options
      if (orientation && !['gay', 'straight', 'lesbian', 'bisexual', 'other'].includes(orientation)) {
        return NextResponse.json({ error: 'Invalid orientation value' }, { status: 400 });
      }

      await db.execute({
        sql: 'UPDATE users SET age = ?, gender = ?, height = ?, weight = ?, bio = ?, orientation = ? WHERE id = ?',
        args: [age || null, gender || null, height || null, weight || null, bio || null, orientation || null, session.user.id]
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute({
      sql: 'SELECT id, name, email, profile_picture, role, age, gender, height, weight, bio, orientation FROM users WHERE id = ?',
      args: [session.user.id]
    });

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profile_picture: user.profile_picture,
      role: user.role,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      bio: user.bio,
      orientation: user.orientation
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}