import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, hashPassword } from '@/lib/auth';

async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (user.role !== 'admin') throw new Error('Admin access required');
  return user;
}

export async function GET(request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    
    const result = await query(
      'SELECT id, username, name, email, role, title, org, specialty, avatar, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const countResult = await query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(countResult.rows[0].total);
    
    return NextResponse.json({ users: result.rows, total }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (error.message?.includes('Admin access required')) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);
    const { username, name, email, password, role, title, org, specialty, avatar } = await request.json();

    if (!username || !name || !email || !password) return NextResponse.json({ error: 'Username, name, email, and password are required' }, { status: 400 });
    const validRoles = ['student', 'professional', 'admin'];
    if (role && !validRoles.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const existing = (await query('SELECT username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1', [username, email])).rows[0];
    if (existing?.username === username) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    if (existing?.email === email) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const password_hash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (username, name, email, password_hash, role, title, org, specialty, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [username, name, email, password_hash, role || 'professional', title || null, org || null, specialty || null, avatar || null]
    );
    const { password_hash: _, ...safe } = result.rows[0];
    return NextResponse.json({ user: safe }, { status: 201 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (error.message?.includes('Admin access required')) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId'));
    if (isNaN(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    if (userId === currentUser.userId) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });

    const user = (await query('SELECT id FROM users WHERE id = $1 LIMIT 1', [userId])).rows[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await query('DELETE FROM users WHERE id = $1', [userId]);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (error.message?.includes('Admin access required')) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
