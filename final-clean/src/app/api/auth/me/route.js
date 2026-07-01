import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, clearAuthCookie } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await requireAuth(request);
    const result = await query('SELECT id, username, name, email, role, title, org, specialty, avatar, created_at FROM users WHERE id = $1 LIMIT 1', [currentUser.userId]);
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required') || error.message?.includes('Invalid or expired')) {
      await clearAuthCookie();
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
