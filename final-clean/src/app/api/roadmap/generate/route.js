import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { UserProfile, engine } from '@/lib/roadmap-engine';

export async function POST(request) {
  try {
    const currentUser = await requireAuth(request);

    // Fetch user's selected career from user_careers table
    const userCareerRes = await query(
      `SELECT c.id, c.name, c.description, c.icon, c.color, c.accent
       FROM user_careers uc
       JOIN careers c ON uc.career_id = c.id
       WHERE uc.user_id = $1 LIMIT 1`,
      [currentUser.userId]
    );

    if (userCareerRes.rows.length === 0) {
      return NextResponse.json({ error: 'No career selected. Please select a career first.' }, { status: 400 });
    }

    const careerRow = userCareerRes.rows[0];
    const careerName = careerRow.name;

    // Fetch completed skills for this user
    const completedRes = await query(
      `SELECT s.name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = $1 AND us.completed = true`,
      [currentUser.userId]
    );

    const completedSkillNames = completedRes.rows.map(r => r.name);

    // Generate roadmap using engine with fetched data
    const userProfile = new UserProfile(currentUser.name, careerName, completedSkillNames);
    const roadmap = engine.generateRoadmap(userProfile);

    return NextResponse.json({
      roadmap: {
        career: {
          id: careerRow.id,
          name: careerRow.name,
          color: careerRow.color,
          accent: careerRow.accent,
          icon: careerRow.icon,
          description: careerRow.description,
        },
        stages: roadmap.stages.map(stage => ({
          stageName: stage.stageName,
          skills: stage.skills.map(skill => ({
            name: skill.name,
            stage: skill.stage,
            weight: skill.weight,
            resources: skill.resources,
          })),
        })),
        skippedSkills: roadmap.skippedSkills,
        totalRequired: roadmap.totalRequired,
        totalRemaining: roadmap.totalRemaining,
        progressPercent: roadmap.progressPercent,
        weightCoverage: roadmap.weightCoverage,
      },
    }, { status: 200 });
  } catch (error) {
    if (error.message?.includes('Authentication required')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (error.message?.includes('Invalid or expired')) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    console.error('Generate roadmap error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
