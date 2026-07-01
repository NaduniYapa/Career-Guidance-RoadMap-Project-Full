import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const currentUser = await requireAuth(request);
    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });

    const notification = (await query('SELECT id, user_id, post_id, type, career, author_name, question, read, created_at FROM notifications WHERE id = $1 AND user_id = $2 LIMIT 1', [notificationId, currentUser.userId])).rows[0];
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

    await query('UPDATE notifications SET read = $1 WHERE id = $2', [true, notificationId]);
    const updated = (await query('SELECT id, user_id, post_id, type, career, author_name, question, read, created_at FROM notifications WHERE id = $1 LIMIT 1', [notificationId])).rows[0];
    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
