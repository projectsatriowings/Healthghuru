/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const categories = await sql`
      SELECT c.*, COUNT(i.id)::int as item_count
      FROM content_categories c
      LEFT JOIN content_items i ON c.name = i.category AND i.status = 'published'
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name ASC
    `;

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { name, slug, description, iconName, displayOrder } = body;
    if (!name || !slug) {
      return NextResponse.json({ success: false, error: { message: 'Name and slug are required' } }, { status: 400 });
    }

    const newId = randomUUID();
    await sql`
      INSERT INTO content_categories (
        id, name, slug, description, icon_name, display_order
      ) VALUES (
        ${newId}::uuid, ${name}, ${slug}, ${description || null}, ${iconName || 'Heart'}, ${displayOrder || 0}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon_name = EXCLUDED.icon_name,
        display_order = EXCLUDED.display_order;
    `;

    return NextResponse.json({ success: true, id: newId });
  } catch (error: any) {
    const code = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: code });
  }
}
