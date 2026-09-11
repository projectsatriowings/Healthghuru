import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const users = await sql`
      SELECT id, name, email FROM users WHERE LOWER(email) = ${cleanEmail}
    `;

    // To prevent email enumeration, if user is not found, return generic success message
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been generated.',
      });
    }

    const user = users[0];

    // Generate secure reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, 
          reset_token_expires = ${expiresAt.toISOString()}::timestamptz
      WHERE id = ${user.id}::uuid
    `;

    const resetUrl = `/login?tab=reset&token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been generated. Follow the link to set a new password.',
      resetToken, // Returned for instant testing and modal integration
      resetUrl,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    );
  }
}
