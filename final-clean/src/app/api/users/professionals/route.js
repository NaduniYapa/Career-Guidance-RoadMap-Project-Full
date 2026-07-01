import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, username, name, title, org, specialty, avatar, role FROM users WHERE role = $1`,
      ['professional']
    );
    return NextResponse.json({ professionals: result.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
