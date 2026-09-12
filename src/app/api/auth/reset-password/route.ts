import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing password reset token.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Verify token and expiry
    const users = await sql`
      SELECT id, email, reset_token_expires 
      FROM users 
      WHERE reset_token = ${token}
        AND reset_token_expires > NOW()
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update password and clear token
    await sql`
      UPDATE users 
      SET password_hash = ${newHash},
          reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}::uuid
    `;

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated! You can now sign in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
