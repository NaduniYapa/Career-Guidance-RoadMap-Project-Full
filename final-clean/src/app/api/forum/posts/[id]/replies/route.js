import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({ text: z.string().min(1) });

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 });

    const user = await requireAuth(request);

    const post = (await query('SELECT id FROM forum_posts WHERE id = $1 LIMIT 1', [postId])).rows[0];
    if (!post) return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Validation error', details: parsed.error.issues }, { status: 400 });

    const isProfessional = user.role === 'professional' || user.role === 'admin';
    const result = await query(
      `INSERT INTO forum_replies (post_id, author_username, author_name, text, is_professional) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [postId, user.username, user.name, parsed.data.text, isProfessional]
    );
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    console.error('Create reply error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reply' }, { status: 500 });
  }
}
