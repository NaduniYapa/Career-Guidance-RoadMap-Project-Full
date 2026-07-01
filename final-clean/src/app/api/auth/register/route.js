import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3).max(255).regex(/^[a-zA-Z0-9_-]+$/),
  name:     z.string().min(1).max(255),
  email:    z.string().email().max(255),
  password: z.string().min(6).max(100),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });

    const { username, name, email, password } = parsed.data;
    const existing = await query('SELECT username, email FROM users WHERE username = $1 OR email = $2 LIMIT 1', [username, email]);
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.username === username) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'student') RETURNING *`,
      [username, name, email, password_hash]
    );
    const newUser = result.rows[0];
    const token = await createToken({ userId: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email, role: newUser.role });
    await setAuthCookie(token);
    const { password_hash: _, ...safe } = newUser;
    return NextResponse.json({ success: true, message: 'Registration successful', user: safe, token }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
