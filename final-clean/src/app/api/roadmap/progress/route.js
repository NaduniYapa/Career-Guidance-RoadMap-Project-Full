import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await requireAuth(request);

    // Fetch user skills with skill details from database
    const skills = (await query(`
      SELECT us.id, us.user_id, s.id as skill_id, s.name as skill_name, us.completed, us.assessed_at
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
    `, [currentUser.userId])).rows;

    return NextResponse.json({ progress: skills }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const currentUser = await requireAuth(request);
    const { skill_name, completed } = await request.json();

    if (!skill_name) return NextResponse.json({ error: 'skill_name is required' }, { status: 400 });
    if (typeof completed !== 'boolean') return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });

    // Look up skill ID by name
    const skillRes = await query('SELECT id FROM skills WHERE name = $1 LIMIT 1', [skill_name]);
    if (skillRes.rows.length === 0) {
      return NextResponse.json({ error: `Skill "${skill_name}" not found` }, { status: 404 });
    }
    const skillId = skillRes.rows[0].id;

    await query(`
      INSERT INTO user_skills (user_id, skill_id, completed, assessed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, skill_id) DO UPDATE
      SET completed = $3, assessed_at = $4
    `, [currentUser.userId, skillId, completed, completed ? new Date() : null]);

    // Fetch the updated skill with details
    const fetchRes = await query(`
      SELECT us.id, us.user_id, s.id as skill_id, s.name as skill_name, us.completed, us.assessed_at
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1 AND us.skill_id = $2
    `, [currentUser.userId, skillId]);

    if (fetchRes.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
    }

    return NextResponse.json({ skill: fetchRes.rows[0] }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    console.error('Skill progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
