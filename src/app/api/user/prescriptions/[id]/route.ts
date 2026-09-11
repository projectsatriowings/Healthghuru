import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Prescription ID is required.' }, { status: 400 });
    }

    await sql`
      DELETE FROM user_prescriptions
      WHERE id = ${id}::uuid AND user_id = ${session.user.id}::uuid;
    `;

    return NextResponse.json({
      success: true,
      message: 'Prescription removed from health vault.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/user/prescriptions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete prescription.' },
      { status: 500 }
    );
  }
}
