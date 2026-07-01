import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await requireAuth(request);
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [currentUser.userId]);
    return NextResponse.json({ notifications: result.rows }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
