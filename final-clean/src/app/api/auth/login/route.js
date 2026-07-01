import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });

    const { username, password } = parsed.data;
    const result = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
    const user = result.rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await createToken({ userId: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
    await setAuthCookie(token);
    const { password_hash, ...safe } = user;
    return NextResponse.json({ success: true, user: safe, token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
