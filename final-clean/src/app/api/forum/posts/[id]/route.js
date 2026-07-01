import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 });

    const post = (await query('SELECT id, author_username, author_name, career, question, tagged_mentor, created_at FROM forum_posts WHERE id = $1 LIMIT 1', [postId])).rows[0];
    if (!post) return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });

    const replies = (await query('SELECT id, post_id, author_username, author_name, text, is_professional, created_at FROM forum_replies WHERE post_id = $1 ORDER BY created_at ASC', [postId])).rows;
    return NextResponse.json({ success: true, data: { ...post, replies } });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 });
  }
}
