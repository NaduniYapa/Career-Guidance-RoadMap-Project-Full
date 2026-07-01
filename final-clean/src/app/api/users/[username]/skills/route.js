import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const user = (await query('SELECT id FROM users WHERE username = $1 LIMIT 1', [username])).rows[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Fetch user skills with skill details from database
    const skills = (await query(`
      SELECT us.id, us.user_id, s.id as skill_id, s.name as skill_name, us.completed, us.assessed_at
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
    `, [user.id])).rows;

    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error('User skills GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const currentUser = await requireAuth(request);
    const { username } = await params;
    if (currentUser.username !== username) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { skills } = await request.json();
    if (!Array.isArray(skills)) return NextResponse.json({ error: 'Skills must be an array' }, { status: 400 });

    // Delete old skills
    await query('DELETE FROM user_skills WHERE user_id = $1', [currentUser.userId]);

    if (skills.length > 0) {
      // Convert skill names to skill IDs by looking them up in database
      for (const skillData of skills) {
        const skillName = skillData.skill_name || skillData.name;
        
        // Find skill ID by name
        const skillRes = await query('SELECT id FROM skills WHERE name = $1 LIMIT 1', [skillName]);
        if (skillRes.rows.length === 0) {
          console.warn(`Skill "${skillName}" not found in database, skipping`);
          continue;
        }

        const skillId = skillRes.rows[0].id;
        await query(
          `INSERT INTO user_skills (user_id, skill_id, completed, assessed_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, skill_id) DO UPDATE
           SET completed = $3, assessed_at = $4`,
          [currentUser.userId, skillId, skillData.completed || false, skillData.assessed_at ? new Date(skillData.assessed_at) : null]
        );
      }
    }

    // Fetch result with skill details
    const result = await query(
      `SELECT us.id, us.user_id, s.id as skill_id, s.name as skill_name, us.completed, us.assessed_at
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1`,
      [currentUser.userId]
    );

    return NextResponse.json({ skills: result.rows }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    console.error('User skills update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
