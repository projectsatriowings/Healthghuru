import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Running community features database migration...');

    // 1. Expert Questions
    await sql`
      CREATE TABLE IF NOT EXISTS expert_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Expert Answers
    await sql`
      CREATE TABLE IF NOT EXISTS expert_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES expert_questions(id) ON DELETE CASCADE,
        expert_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Article Collections
    await sql`
      CREATE TABLE IF NOT EXISTS article_collections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Update user_saved_articles to support collections
    // Try to add the column, catch error if it already exists
    try {
      await sql`ALTER TABLE user_saved_articles ADD COLUMN collection_id UUID REFERENCES article_collections(id) ON DELETE SET NULL;`;
    } catch (e: any) {
      if (e.code !== '42701') { // 42701 is duplicate_column
        throw e;
      }
    }

    // 5. Article Comments
    await sql`
      CREATE TABLE IF NOT EXISTS article_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({ success: true, message: 'Community features migration completed successfully.' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
