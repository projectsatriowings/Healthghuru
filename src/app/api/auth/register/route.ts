import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, subscribeNewsletter } = await req.json();

    if (!email || !email.includes('@') || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === 'string') ? name.trim() : 'HealthGuru Member';

    // Check if user already exists
    const existing = await sql`
      SELECT id, role, status FROM users WHERE LOWER(email) = ${cleanEmail}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL
    const inserted = await sql`
      INSERT INTO users (name, email, password_hash, role, status, email_verified, created_at, updated_at)
      VALUES (${cleanName}, ${cleanEmail}, ${passwordHash}, 'user', 'active', TRUE, NOW(), NOW())
      RETURNING id, name, email, role, status, created_at
    `;

    const newUser = inserted[0];

    // Initialize user plan (free tier)
    try {
      await sql`
        INSERT INTO user_plans (user_id, tier, records_used, records_limit, active_goals_limit, family_members_limit, ads_enabled)
        VALUES (${newUser.id}::uuid, 'free', 0, 10, 3, 0, TRUE)
        ON CONFLICT (user_id) DO NOTHING
      `;
    } catch (planErr) {
      console.warn('User plan initialization notice:', planErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      message: 'Account created successfully! Welcome to HealthGuru.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
