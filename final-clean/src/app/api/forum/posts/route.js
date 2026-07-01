import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const createPostSchema = z.object({
  career:         z.string().min(1),
  question:       z.string().min(10),
  tagged_mentor:  z.string().optional(),
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const postsResult = await query(`
      SELECT
        fp.id, fp.author_username, fp.author_name, fp.career, fp.question,
        fp.tagged_mentor, fp.created_at
      FROM forum_posts fp
      ORDER BY fp.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    if (postsResult.rows.length === 0) {
      return NextResponse.json({ posts: [], total: 0 }, { status: 200 });
    }

    const postIds = postsResult.rows.map(p => p.id);
    const repliesResult = await query(`
      SELECT id, post_id, author_username, author_name, text, is_professional, created_at
      FROM forum_replies
      WHERE post_id = ANY($1::int[])
      ORDER BY created_at ASC
    `, [postIds]);

    const repliesByPost = {};
    for (const reply of repliesResult.rows) {
      if (!repliesByPost[reply.post_id]) repliesByPost[reply.post_id] = [];
      repliesByPost[reply.post_id].push({
        id: reply.id,
        author_username: reply.author_username,
        author_name: reply.author_name,
        text: reply.text,
        is_professional: reply.is_professional,
        created_at: reply.created_at,
      });
    }

    const posts = postsResult.rows.map(p => ({
      id: p.id,
      author_username: p.author_username,
      author_name: p.author_name,
      career: p.career,
      question: p.question,
      tagged_mentor: p.tagged_mentor,
      created_at: p.created_at,
      replies: repliesByPost[p.id] || [],
    }));

    const countResult = await query('SELECT COUNT(*) as total FROM forum_posts');
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({ success: true, data: posts, total }, { status: 200 });
  } catch (error) {
    console.error('Get forum posts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forum posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.issues }, { status: 400 });

    const { career, question, tagged_mentor } = parsed.data;
    const result = await query(
      `INSERT INTO forum_posts (author_username, author_name, career, question, tagged_mentor) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user.username, user.name, career, question, tagged_mentor || null]
    );
    return NextResponse.json({ success: true, data: { ...result.rows[0], replies: [] } }, { status: 201 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    console.error('Create post error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create forum post' }, { status: 500 });
  }
}
