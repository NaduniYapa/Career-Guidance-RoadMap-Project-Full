import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const result = await query(`
      SELECT id, name, description, icon, color, accent
      FROM careers
      ORDER BY name
    `);

    const careers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      accent: row.accent,
    }));

    return NextResponse.json({ careers }, { status: 200 });
  } catch (error) {
    console.error('Careers GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
