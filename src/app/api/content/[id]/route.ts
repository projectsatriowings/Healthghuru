/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { writeAuditLog } from '@/lib/admin/actions/auditLog';
import { randomUUID } from 'crypto';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await sql`
      SELECT 
        i.*,
        s.name as source_name,
        s.trust_score as source_trust_score,
        s.type as source_type,
        s.website_url as source_website_url
      FROM content_items i
      LEFT JOIN content_sources s ON i.source_id = s.id
      WHERE i.id = ${params.id}::uuid AND i.deleted_at IS NULL
    `;

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Item not found' } }, { status: 404 });
    }

    const tags = await sql`
      SELECT t.id, t.name, t.slug
      FROM content_item_tags it
      JOIN content_tags t ON it.tag_id = t.id
      WHERE it.content_item_id = ${params.id}::uuid
    `;

    return NextResponse.json({
      success: true,
      item: {
        ...items[0],
        tags,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const existing = await sql`SELECT * FROM content_items WHERE id = ${params.id}::uuid`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Item not found' } }, { status: 404 });
    }

    const {
      status,
      category,
      subcategory,
      isBreaking,
      isFeatured,
      isTrending,
      requiresReview,
      reviewAction,
      reviewNotes,
    } = body;

    await sql`
      UPDATE content_items
      SET
        status = COALESCE(${status || null}, status),
        category = COALESCE(${category || null}, category),
        subcategory = COALESCE(${subcategory || null}, subcategory),
        is_breaking = COALESCE(${isBreaking !== undefined ? isBreaking : null}, is_breaking),
        is_featured = COALESCE(${isFeatured !== undefined ? isFeatured : null}, is_featured),
        is_trending = COALESCE(${isTrending !== undefined ? isTrending : null}, is_trending),
        requires_review = COALESCE(${requiresReview !== undefined ? requiresReview : null}, requires_review),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}::uuid;
    `;

    // Record editorial review action if provided
    if (reviewAction) {
      const reviewId = randomUUID();
      await sql`
        INSERT INTO content_reviews (
          id, content_item_id, reviewer_user_id, action, notes
        ) VALUES (
          ${reviewId}::uuid, ${params.id}::uuid, ${session.user.id}::uuid, ${reviewAction}, ${reviewNotes || null}
        );
      `;
    }

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: reviewAction ? `content_review_${reviewAction}` : 'content_update',
      targetTable: 'content_items',
      targetId: params.id,
      beforeValue: { status: existing[0].status, category: existing[0].category },
      afterValue: body,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const code = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: code });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();

    await sql`
      UPDATE content_items
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}::uuid;
    `;

    await writeAuditLog({
      adminUserId: session.user.id,
      actionType: 'content_soft_delete',
      targetTable: 'content_items',
      targetId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const code = error.message === 'Unauthorized' || error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: code });
  }
}
