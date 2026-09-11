import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';
import { analyzePrescriptionText } from '@/lib/prescription-analyzer';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const prescriptions = await sql`
      SELECT 
        id, user_id, title, doctor_or_facility, file_url, file_name,
        raw_text, detected_conditions, matched_categories, actionable_insights,
        created_at, updated_at
      FROM user_prescriptions
      WHERE user_id = ${session.user.id}::uuid
      ORDER BY created_at DESC
    `;

    // Aggregate all unique matched categories across user's prescriptions
    const allCategories = new Set<string>();
    prescriptions.forEach((p) => {
      const cats: string[] = Array.isArray(p.matched_categories) ? p.matched_categories : [];
      cats.forEach((c) => allCategories.add(c));
    });

    // Query matched content recommendations for these categories
    let matchedItems: any[] = [];
    if (allCategories.size > 0) {
      const recResult = await getPersonalizedRecommendations({
        userId: session.user.id,
        limit: 8,
      });
      matchedItems = recResult.items;
    }

    return NextResponse.json({
      success: true,
      prescriptions,
      total: prescriptions.length,
      matchedCategories: Array.from(allCategories),
      matchedContent: matchedItems,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/prescriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve prescriptions.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title = 'Medical Prescription',
      doctorOrFacility = null,
      fileUrl = null,
      fileName = null,
      rawText = '',
    } = body;

    // Combine title, doctor, and notes for deep clinical keyword extraction
    const combinedText = `${title} ${doctorOrFacility || ''} ${rawText || ''}`;
    const analysis = analyzePrescriptionText(combinedText);

    // Insert prescription record in PostgreSQL
    const inserted = await sql`
      INSERT INTO user_prescriptions (
        user_id, title, doctor_or_facility, file_url, file_name,
        raw_text, detected_conditions, matched_categories, actionable_insights,
        created_at, updated_at
      ) VALUES (
        ${session.user.id}::uuid,
        ${title.trim() || 'Medical Prescription'},
        ${doctorOrFacility?.trim() || null},
        ${fileUrl},
        ${fileName},
        ${rawText?.trim() || null},
        ${JSON.stringify(analysis.detectedConditions)}::jsonb,
        ${JSON.stringify(analysis.matchedCategories)}::jsonb,
        ${JSON.stringify(analysis.actionableInsights)}::jsonb,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const prescription = inserted[0];

    // Auto-sync detected health categories into user's topic preferences
    for (const category of analysis.matchedCategories) {
      await sql`
        INSERT INTO user_preferences (user_id, topic, preference_type)
        VALUES (${session.user.id}::uuid, ${category}, 'interest')
        ON CONFLICT (user_id, topic, preference_type) DO NOTHING;
      `;
    }

    // Fetch immediate tailored recommendations for this prescription
    const recommendationResult = await getPersonalizedRecommendations({
      userId: session.user.id,
      limit: 6,
    });

    return NextResponse.json({
      success: true,
      message: 'Prescription uploaded and analyzed successfully!',
      prescription,
      analysis,
      matchedContent: recommendationResult.items,
    });
  } catch (error: any) {
    console.error('Error in POST /api/user/prescriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload and analyze prescription.' },
      { status: 500 }
    );
  }
}
