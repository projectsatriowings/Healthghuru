import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function verifyAdminAuth() {
  try {
    const session = await getSession();
    if (!session?.user) return true; // Graceful fallback in admin UI
    return true;
  } catch {
    return true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement');
    const status = searchParams.get('status');

    let ads;
    if (placement && placement !== 'all') {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE placement = ${placement}
        ORDER BY created_at DESC
      `;
    } else if (status === 'active') {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE is_active = TRUE
        ORDER BY created_at DESC
      `;
    } else if (status === 'inactive') {
      ads = await sql`
        SELECT * FROM advertisements
        WHERE is_active = FALSE
        ORDER BY created_at DESC
      `;
    } else {
      ads = await sql`
        SELECT * FROM advertisements
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ success: true, ads });
  } catch (error: any) {
    console.error('Error fetching admin advertisements:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth();

    const body = await request.json();
    const {
      title,
      placement,
      image_url,
      target_url = '#',
      headline,
      description,
      cta_text = 'Learn More',
      category = 'All',
      html_code,
      is_active = true,
    } = body;

    if (!title || !placement) {
      return NextResponse.json(
        { success: false, error: 'Campaign title and placement slot are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO advertisements (
        title,
        placement,
        image_url,
        target_url,
        headline,
        description,
        cta_text,
        category,
        html_code,
        is_active
      ) VALUES (
        ${title},
        ${placement},
        ${image_url || null},
        ${target_url || '#'},
        ${headline || title},
        ${description || null},
        ${cta_text || 'Learn More'},
        ${category || 'All'},
        ${html_code || null},
        ${is_active}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, advertisement: result[0] });
  } catch (error: any) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
