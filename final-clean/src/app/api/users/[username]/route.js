import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const result = await query(`
      SELECT
        u.id, u.username, u.email, u.name, u.role, u.avatar, u.created_at,
        c.id as career_id, c.name as career_name, c.description as career_description, 
        c.icon as career_icon, c.color as career_color, c.accent as career_accent,
        uc.selected_at as career_selected_at
      FROM users u
      LEFT JOIN user_careers uc ON u.id = uc.user_id
      LEFT JOIN careers c ON uc.career_id = c.id
      WHERE u.username = $1
      LIMIT 1
    `, [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const career = row.career_id ? {
      id: row.career_id,
      name: row.career_name,
      description: row.career_description,
      icon: row.career_icon,
      color: row.career_color,
      accent: row.career_accent,
      selected_at: row.career_selected_at,
    } : null;

    return NextResponse.json({
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        created_at: row.created_at,
      },
      career,
    }, { status: 200 });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await requireAuth(request);
    const { username } = await params;
    if (currentUser.username !== username) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const { name, title, org, specialty, avatar, selected_career } = body;

    const updates = []; const values = []; let i = 1;
    if (name !== undefined)      { updates.push(`name = $${i++}`);      values.push(name); }
    if (title !== undefined)     { updates.push(`title = $${i++}`);     values.push(title); }
    if (org !== undefined)       { updates.push(`org = $${i++}`);       values.push(org); }
    if (specialty !== undefined) { updates.push(`specialty = $${i++}`); values.push(specialty); }
    if (avatar !== undefined)    { updates.push(`avatar = $${i++}`);    values.push(avatar); }
    
    if (updates.length > 0) {
      values.push(currentUser.userId);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    if (selected_career !== undefined) {
      const careerRes = await query('SELECT id FROM careers WHERE name = $1 LIMIT 1', [selected_career]);
      if (careerRes.rows.length === 0) {
        return NextResponse.json({ error: `Career '${selected_career}' not found` }, { status: 400 });
      }
      const careerId = careerRes.rows[0].id;

      await query(`
        INSERT INTO user_careers (user_id, career_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET career_id = $2, selected_at = CURRENT_TIMESTAMP
      `, [currentUser.userId, careerId]);
    }

    const result = await query(`
      SELECT
        u.id, u.username, u.email, u.name, u.role, u.avatar, u.created_at,
        c.id as career_id, c.name as career_name, c.description as career_description,
        c.icon as career_icon, c.color as career_color, c.accent as career_accent,
        uc.selected_at as career_selected_at
      FROM users u
      LEFT JOIN user_careers uc ON u.id = uc.user_id
      LEFT JOIN careers c ON uc.career_id = c.id
      WHERE u.id = $1
    `, [currentUser.userId]);

    const row = result.rows[0];
    const career = row.career_id ? {
      id: row.career_id,
      name: row.career_name,
      description: row.career_description,
      icon: row.career_icon,
      color: row.career_color,
      accent: row.career_accent,
      selected_at: row.career_selected_at,
    } : null;

    return NextResponse.json({
      user: {
        id: row.id,
        username: row.username,
        email: row.email,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        created_at: row.created_at,
      },
      career,
    }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
