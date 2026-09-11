import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Ensure subscribers table exists
    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'active'
      )
    `;

    // Insert or ignore if already subscribed
    await sql`
      INSERT INTO newsletter_subscribers (email)
      VALUES (${email.trim().toLowerCase()})
      ON CONFLICT (email) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to HealthGuru updates!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
