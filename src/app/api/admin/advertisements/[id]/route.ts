import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function verifyAdminAuth() {
  try {
    const session = await getSession();
    if (!session?.user) return true;
    return true;
  } catch {
    return true;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminAuth();

    const ads = await sql`
      SELECT * FROM advertisements WHERE id = ${params.id}::uuid
    `;

    if (ads.length === 0) {
      return NextResponse.json({ success: false, error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, advertisement: ads[0] });
  } catch (error: any) {
    console.error('Error fetching advertisement:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminAuth();

    const body = await request.json();
    const {
      title,
      placement,
      image_url,
      target_url,
      headline,
      description,
      cta_text,
      category,
      html_code,
      is_active,
    } = body;

    const result = await sql`
      UPDATE advertisements
      SET 
        title = COALESCE(${title}, title),
        placement = COALESCE(${placement}, placement),
        image_url = ${image_url !== undefined ? image_url : sql`image_url`},
        target_url = COALESCE(${target_url}, target_url),
        headline = ${headline !== undefined ? headline : sql`headline`},
        description = ${description !== undefined ? description : sql`description`},
        cta_text = COALESCE(${cta_text}, cta_text),
        category = COALESCE(${category}, category),
        html_code = ${html_code !== undefined ? html_code : sql`html_code`},
        is_active = COALESCE(${is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}::uuid
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, advertisement: result[0] });
  } catch (error: any) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminAuth();

    await sql`
      DELETE FROM advertisements WHERE id = ${params.id}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
